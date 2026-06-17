package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.AvaliarSubmissaoRequestDTO;
import com.questio.questio_backend.dto.DesempenhoAlunoDTO;
import com.questio.questio_backend.dto.DesempenhoPendenteDTO;
import com.questio.questio_backend.dto.DesempenhoTurmaDTO;
import com.questio.questio_backend.dto.SubmissaoAvaliadaDTO;
import com.questio.questio_backend.entity.Class;
import com.questio.questio_backend.entity.SubmitTask;
import com.questio.questio_backend.entity.Task;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.repository.ClassRepository;
import com.questio.questio_backend.repository.SubmitRepository;
import com.questio.questio_backend.repository.TaskRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DesempenhoService {

    private final ClassRepository classRepository;
    private final TaskRepository taskRepository;
    private final SubmitRepository submitRepository;
    private final TaskService taskService;

    private User getProfessorAutenticado() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new RuntimeException("Usuário não autenticado");
        }

        boolean isProfessor = user.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_PROFESSOR"));

        if (!isProfessor) {
            throw new RuntimeException("Acesso permitido apenas para professores.");
        }

        return user;
    }

    public List<DesempenhoTurmaDTO> listarTurmasDoProfessor() {
        User professor = getProfessorAutenticado();

        return classRepository.findByProfessorIdUsuarioOrderByNomeAsc(professor.getIdUsuario()).stream()
                .map(turma -> new DesempenhoTurmaDTO(turma.getIdClass(), turma.getNome()))
                .toList();
    }

    @Transactional
    public List<DesempenhoAlunoDTO> listarDesempenhoDaTurma(UUID idTurma) {
        User professor = getProfessorAutenticado();
        Class turma = getTurmaDoProfessor(idTurma, professor.getIdUsuario());

        List<Task> tarefas = taskRepository.findByTurmaIdClassOrderByPrazoAsc(idTurma);
        List<SubmitTask> submissoes = submitRepository.findByTarefaTurmaIdClass(idTurma);

        Map<UUID, List<SubmitTask>> submissoesPorAluno = submissoes.stream()
                .filter(item -> item.getAluno() != null)
                .collect(Collectors.groupingBy(item -> item.getAluno().getIdUsuario()));

        return turma.getAlunos().stream()
                .sorted(Comparator.comparing(User::getNome, String.CASE_INSENSITIVE_ORDER))
                .map(aluno -> mapAluno(aluno, tarefas, submissoesPorAluno.getOrDefault(aluno.getIdUsuario(), List.of())))
                .toList();
    }

    @Transactional
    public SubmissaoAvaliadaDTO avaliarSubmissao(UUID idSubmissao, AvaliarSubmissaoRequestDTO dto) {
        User professor = getProfessorAutenticado();

        SubmitTask submissao = submitRepository.findById(idSubmissao)
                .orElseThrow(() -> new RuntimeException("Submissão não encontrada"));

        if (submissao.getTarefa() == null || submissao.getTarefa().getTurma() == null) {
            throw new RuntimeException("A submissão selecionada não possui turma vinculada.");
        }

        UUID idProfessorDaTurma = submissao.getTarefa().getTurma().getProfessor() != null
                ? submissao.getTarefa().getTurma().getProfessor().getIdUsuario()
                : null;

        if (idProfessorDaTurma == null || !idProfessorDaTurma.equals(professor.getIdUsuario())) {
            throw new RuntimeException("Você não pode avaliar submissões de outra turma.");
        }

        submissao.setNota(dto.nota());
        submissao.setFeedback(dto.feedback() != null ? dto.feedback().trim() : null);
        submissao.setAvaliadoEm(LocalDateTime.now());
        submissao.setStatus("Avaliado");

        SubmitTask salva = submitRepository.save(submissao);

        return new SubmissaoAvaliadaDTO(
                salva.getIdSubmit(),
                salva.getNota(),
                salva.getFeedback(),
                salva.getAvaliadoEm()
        );
    }

    private Class getTurmaDoProfessor(UUID idTurma, UUID idProfessor) {
        Class turma = classRepository.findById(idTurma)
                .orElseThrow(() -> new RuntimeException("Turma não encontrada"));

        UUID idProfessorTurma = turma.getProfessor() != null ? turma.getProfessor().getIdUsuario() : null;
        if (idProfessorTurma == null || !idProfessorTurma.equals(idProfessor)) {
            throw new RuntimeException("Você não possui acesso a esta turma.");
        }

        return turma;
    }

    private DesempenhoAlunoDTO mapAluno(User aluno, List<Task> tarefas, List<SubmitTask> submissoesDoAluno) {
        int tarefasTotal = tarefas.size();
        int tarefasConcluidas = submissoesDoAluno.size();
        int tarefasSemEntrega = Math.max(tarefasTotal - tarefasConcluidas, 0);

        List<SubmitTask> avaliadas = submissoesDoAluno.stream()
                .filter(item -> item.getNota() != null)
                .toList();

        Float mediaNotas = avaliadas.isEmpty()
                ? null
                : (float) avaliadas.stream()
                .mapToDouble(item -> item.getNota())
                .average()
                .orElse(0);

        List<DesempenhoPendenteDTO> pendencias = submissoesDoAluno.stream()
                .filter(item -> item.getNota() == null)
                .sorted(Comparator.comparing(item -> item.getTarefa().getPrazo(), Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::mapPendente)
                .toList();

        return new DesempenhoAlunoDTO(
                aluno.getIdUsuario(),
                aluno.getNome(),
                tarefasConcluidas,
                tarefasTotal,
                pendencias.size(),
                tarefasSemEntrega,
                mediaNotas,
                pendencias
        );
    }

    private DesempenhoPendenteDTO mapPendente(SubmitTask item) {
        return new DesempenhoPendenteDTO(
                item.getIdSubmit(),
                item.getTarefa().getIdTask(),
                item.getTarefa().getTitulo(),
                item.getTarefa().getPrazo(),
                item.getEnviadoEm(),
                item.getStatus(),
                item.getNota(),
                item.getFeedback(),
                item.getResposta(),
                item.getArquivoNome(),
                item.getArquivoUrl() != null
                        ? "/tarefas/submissoes/" + item.getIdSubmit() + "/arquivo-link"
                        : null
        );
    }
}
