package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.TaskRequestDTO;
import com.questio.questio_backend.dto.TaskResponseDTO;
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


        return new TaskResponseDTO(salva.getIdTask(), salva.getTitulo(), salva.getDescricao(), salva.getPrazo(), false, salva.getPontos());
    }

    @Transactional
    public String submeterTarefa(UUID idTarefa) {
        User aluno = getUsuarioAutenticado();

        if (Boolean.TRUE.equals(aluno.getAcessoBloqueado())) {
            throw new RuntimeException("Acesso bloqueado. Entre em contato com a coordenação.");
        }

        Task tarefa = tarefaRepository.findById(idTarefa)
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada"));

        if (submissaoRepository.existsByAlunoAndTarefa(aluno, tarefa)) {
            throw new RuntimeException("Você já submeteu esta tarefa!");
        }

        SubmitTask submissao = SubmitTask.builder()
                .aluno(aluno)
                .tarefa(tarefa)
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

        return tarefaRepository.findByTurmaIn(turmas).stream()
                .map(t -> {

                    boolean isConcluida = submissaoRepository.existsByAlunoAndTarefa(aluno, t);

                    return new TaskResponseDTO(
                            t.getIdTask(),
                            t.getTitulo(),
                            t.getDescricao(),
                            t.getPrazo(),
                            isConcluida,
                            t.getPontos()
                    );
                })
                .toList();
    }
}
