package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.TaskRequestDTO;
import com.questio.questio_backend.dto.TaskResponseDTO;
import com.questio.questio_backend.dto.TaskSubmissionRequestDTO;
import com.questio.questio_backend.entity.Class;
import com.questio.questio_backend.entity.SubmitTask;
import com.questio.questio_backend.entity.Task;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.repository.ClassRepository;
import com.questio.questio_backend.repository.SubmitRepository;
import com.questio.questio_backend.repository.TaskRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository tarefaRepository;
    private final SubmitRepository submissaoRepository;
    private final ClassRepository turmaRepository;
    private final GamificationService gamificationService;

    private User getUsuarioAutenticado() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new RuntimeException("Usuário não autenticado");
        }

        return user;
    }

    @Transactional
    public TaskResponseDTO criarTarefa(TaskRequestDTO dto) {
        User professor = getUsuarioAutenticado();

        Class turma = turmaRepository.findById(dto.idClass())
                .orElseThrow(() -> new RuntimeException("Turma não encontrada"));

        if (turma.getProfessor() == null || !Objects.equals(turma.getProfessor().getIdUsuario(), professor.getIdUsuario())) {
            throw new RuntimeException("Você só pode criar tarefas para turmas vinculadas ao seu perfil.");
        }

        Task novaTarefa = Task.builder()
                .titulo(dto.titulo())
                .descricao(dto.descricao())
                .prazo(dto.prazo())
                .pontos(dto.pontos())
                .status("Pendente")
                .professor(professor)
                .turma(turma)
                .build();

        Task salva = tarefaRepository.save(novaTarefa);


        return new TaskResponseDTO(
                salva.getIdTask(),
                salva.getTitulo(),
                salva.getDescricao(),
                salva.getPrazo(),
                false,
                salva.getPontos(),
                null,
                null,
                null
        );
    }

    @Transactional
    public String submeterTarefa(UUID idTarefa, TaskSubmissionRequestDTO dto) {
        User aluno = getUsuarioAutenticado();

        if (Boolean.TRUE.equals(aluno.getAcessoBloqueado())) {
            throw new RuntimeException("Acesso bloqueado. Entre em contato com a coordenação.");
        }

        Task tarefa = tarefaRepository.findById(idTarefa)
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada"));

        if (tarefa.getTurma() == null || !aluno.getTurmas().contains(tarefa.getTurma())) {
            throw new RuntimeException("Você não possui acesso a esta tarefa.");
        }

        if (submissaoRepository.existsByAlunoAndTarefa(aluno, tarefa)) {
            throw new RuntimeException("Você já submeteu esta tarefa!");
        }

        String resposta = dto != null && dto.resposta() != null ? dto.resposta().trim() : null;

        SubmitTask submissao = SubmitTask.builder()
                .aluno(aluno)
                .tarefa(tarefa)
                .resposta(resposta == null || resposta.isBlank() ? null : resposta)
                .status("Concluido")
                .enviadoEm(LocalDateTime.now())
                .build();

        submissaoRepository.save(submissao);

        gamificationService.touchActivity(aluno.getIdUsuario());
        gamificationService.addXp(aluno.getIdUsuario(), tarefa.getPontos() == null ? 0 : tarefa.getPontos());

        return "Tarefa concluída com sucesso! +" + tarefa.getPontos() + " XP";
    }

    public List<TaskResponseDTO> listarTarefasDoAluno() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User aluno)) {
            throw new RuntimeException("Usuário não autenticado");
        }

        if (Boolean.TRUE.equals(aluno.getAcessoBloqueado())) {
            throw new RuntimeException("Acesso bloqueado. Entre em contato com a coordenação.");
        }

        Set<Class> turmas = aluno.getTurmas();

        var submissoesPorTarefa = submissaoRepository.findByAluno(aluno).stream()
                .collect(Collectors.toMap(
                        item -> item.getTarefa().getIdTask(),
                        item -> item,
                        (first, second) -> first
                ));

        return tarefaRepository.findByTurmaIn(turmas).stream()
                .map(t -> {
                    SubmitTask submissao = submissoesPorTarefa.get(t.getIdTask());
                    boolean isConcluida = submissao != null;

                    return new TaskResponseDTO(
                            t.getIdTask(),
                            t.getTitulo(),
                            t.getDescricao(),
                            t.getPrazo(),
                            isConcluida,
                            t.getPontos(),
                            submissao != null ? submissao.getResposta() : null,
                            submissao != null ? submissao.getStatus() : null,
                            submissao != null ? submissao.getEnviadoEm() : null
                    );
                })
                .toList();
    }
}
