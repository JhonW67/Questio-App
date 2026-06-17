package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.TaskRequestDTO;
import com.questio.questio_backend.dto.TaskMaterialDTO;
import com.questio.questio_backend.dto.TaskResponseDTO;
import com.questio.questio_backend.dto.TaskSubmissionRequestDTO;
import com.questio.questio_backend.entity.Class;
import com.questio.questio_backend.entity.SubmitTask;
import com.questio.questio_backend.entity.Task;
import com.questio.questio_backend.entity.TaskMaterial;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.repository.ClassRepository;
import com.questio.questio_backend.repository.SubmitRepository;
import com.questio.questio_backend.repository.TaskMaterialRepository;
import com.questio.questio_backend.repository.TaskRepository;
import com.questio.questio_backend.repository.UserRepository;
import com.questio.questio_backend.repository.TurmaOfertaRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository tarefaRepository;
    private final SubmitRepository submissaoRepository;
    private final ClassRepository turmaRepository;
    private final GamificationService gamificationService;
    private final SubmissionStorageService submissionStorageService;
    private final TaskMaterialStorageService taskMaterialStorageService;
    private final TaskMaterialRepository taskMaterialRepository;
    private final TokenService tokenService;
    private final UserRepository userRepository;
    private final TurmaOfertaRepository turmaOfertaRepository;

    private User getUsuarioAutenticado() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new RuntimeException("Usuário não autenticado");
        }

        return user;
    }

    private User getUsuarioAutenticadoComTurmas() {
        User user = getUsuarioAutenticado();
        return userRepository.findByIdUsuario(user.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuário não autenticado"));
    }

    @Transactional
    public TaskResponseDTO criarTarefa(TaskRequestDTO dto) {
        User professor = getUsuarioAutenticado();

        Class turma = turmaRepository.findById(dto.idTurma())
                .orElseThrow(() -> new RuntimeException("Turma não encontrada"));

        var oferta = turmaOfertaRepository.findByTurmaIdClassAndDisciplinaIdDisciplinaAndProfessorIdUsuario(
                turma.getIdClass(),
                dto.idDisciplina(),
                professor.getIdUsuario()
        ).orElseThrow(() -> new RuntimeException("Você não está vinculado a esta disciplina nesta turma."));

        Task novaTarefa = Task.builder()
                .titulo(dto.titulo())
                .descricao(dto.descricao())
                .prazo(dto.prazo())
                .pontos(dto.pontos())
                .status("Pendente")
                .professor(professor)
                .turma(turma)
                .oferta(oferta)
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
                null,
                null,
                null,
                List.of()
        );
    }

    @Transactional
    public String submeterTarefa(UUID idTarefa, TaskSubmissionRequestDTO dto, MultipartFile arquivo) {
        return submeterTarefaInterna(idTarefa, dto, arquivo, false);
    }

    @Transactional
    public String submeterTarefaRapida(UUID idTarefa) {
        return submeterTarefaInterna(idTarefa, new TaskSubmissionRequestDTO(null), null, true);
    }

    private String submeterTarefaInterna(
            UUID idTarefa,
            TaskSubmissionRequestDTO dto,
            MultipartFile arquivo,
            boolean allowEmptySubmission
    ) {
        User aluno = getUsuarioAutenticadoComTurmas();

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
        boolean semResposta = resposta == null || resposta.isBlank();
        boolean semArquivo = arquivo == null || arquivo.isEmpty();

        if (semResposta && semArquivo && !allowEmptySubmission) {
            throw new RuntimeException("Envie uma resposta textual ou anexe um arquivo para concluir a tarefa.");
        }

        SubmissionStorageService.StoredSubmissionFile storedFile = submissionStorageService.store(arquivo);

        SubmitTask submissao = SubmitTask.builder()
                .aluno(aluno)
                .tarefa(tarefa)
                .resposta(resposta == null || resposta.isBlank() ? null : resposta)
                .arquivoNome(storedFile != null ? storedFile.originalFilename() : null)
                .arquivoUrl(storedFile != null ? storedFile.storedPath() : null)
                .status("Concluido")
                .enviadoEm(LocalDateTime.now())
                .build();

        submissaoRepository.save(submissao);

        gamificationService.touchActivity(aluno.getIdUsuario());
        gamificationService.addXp(aluno.getIdUsuario(), tarefa.getPontos() == null ? 0 : tarefa.getPontos());

        return "Tarefa concluída com sucesso! +" + tarefa.getPontos() + " XP";
    }

    public List<TaskResponseDTO> listarTarefasDoAluno() {
        User aluno = getUsuarioAutenticadoComTurmas();

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

        List<Task> tarefas = tarefaRepository.findByTurmaIn(turmas);
        List<UUID> tarefaIds = tarefas.stream().map(Task::getIdTask).toList();

        Map<UUID, List<TaskMaterialDTO>> materiaisPorTarefa = tarefaIds.isEmpty()
                ? Map.of()
                : taskMaterialRepository.findByTarefaIdTaskIn(tarefaIds).stream()
                .sorted(Comparator.comparing(TaskMaterial::getEnviadoEm, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.groupingBy(
                        item -> item.getTarefa().getIdTask(),
                        Collectors.mapping(this::mapMaterial, Collectors.toCollection(ArrayList::new))
                ));

        return tarefas.stream()
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
                            submissao != null ? submissao.getEnviadoEm() : null,
                            submissao != null ? submissao.getArquivoNome() : null,
                            submissao != null ? buildAttachmentUrl(submissao) : null,
                            materiaisPorTarefa.getOrDefault(t.getIdTask(), List.of())
                    );
                })
                .toList();
    }

    @Transactional
    public List<TaskMaterialDTO> anexarMateriais(UUID idTarefa, List<MultipartFile> arquivos) {
        User professor = getUsuarioAutenticado();
        Task tarefa = tarefaRepository.findById(idTarefa)
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada"));

        if (tarefa.getTurma() == null
                || tarefa.getTurma().getProfessor() == null
                || !Objects.equals(tarefa.getTurma().getProfessor().getIdUsuario(), professor.getIdUsuario())) {
            throw new RuntimeException("Você só pode anexar materiais em tarefas das suas turmas.");
        }

        if (arquivos == null || arquivos.isEmpty()) {
            return List.of();
        }

        List<TaskMaterialDTO> saved = new ArrayList<>();
        for (MultipartFile arquivo : arquivos) {
            TaskMaterialStorageService.StoredTaskMaterialFile stored = taskMaterialStorageService.store(arquivo);
            if (stored == null) {
                continue;
            }

            TaskMaterial material = TaskMaterial.builder()
                    .tarefa(tarefa)
                    .arquivoNome(stored.originalFilename())
                    .arquivoUrl(stored.storedPath())
                    .enviadoEm(LocalDateTime.now())
                    .build();
            TaskMaterial persisted = taskMaterialRepository.save(material);
            saved.add(mapMaterial(persisted));
        }

        return saved;
    }

    public List<TaskMaterialDTO> listarMateriais(UUID idTarefa) {
        Task tarefa = tarefaRepository.findById(idTarefa)
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada"));

        User usuario = getUsuarioAutenticadoComTurmas();
        boolean isAluno = tarefa.getTurma() != null && usuario.getTurmas() != null && usuario.getTurmas().contains(tarefa.getTurma());
        boolean isProfessorDaTurma = tarefa.getTurma() != null
                && tarefa.getTurma().getProfessor() != null
                && Objects.equals(tarefa.getTurma().getProfessor().getIdUsuario(), usuario.getIdUsuario());

        if (!isAluno && !isProfessorDaTurma) {
            throw new RuntimeException("Você não possui acesso a estes materiais.");
        }

        return taskMaterialRepository.findByTarefaIdTaskOrderByEnviadoEmAsc(idTarefa).stream()
                .map(this::mapMaterial)
                .toList();
    }

    public TaskMaterial buscarMaterialComPermissao(UUID idMaterial) {
        User usuario = getUsuarioAutenticadoComTurmas();
        TaskMaterial material = taskMaterialRepository.findById(idMaterial)
                .orElseThrow(() -> new RuntimeException("Material não encontrado"));

        Task tarefa = material.getTarefa();
        boolean isAlunoDaTurma = tarefa != null
                && tarefa.getTurma() != null
                && usuario.getTurmas() != null
                && usuario.getTurmas().contains(tarefa.getTurma());

        boolean isProfessorDaTurma = tarefa != null
                && tarefa.getTurma() != null
                && tarefa.getTurma().getProfessor() != null
                && Objects.equals(tarefa.getTurma().getProfessor().getIdUsuario(), usuario.getIdUsuario());

        if (!isAlunoDaTurma && !isProfessorDaTurma) {
            throw new RuntimeException("Você não possui acesso a este material.");
        }

        return material;
    }

    public java.nio.file.Path carregarArquivoMaterial(UUID idMaterial) {
        TaskMaterial material = buscarMaterialComPermissao(idMaterial);
        return taskMaterialStorageService.load(material.getArquivoUrl());
    }

    public java.nio.file.Path carregarArquivoMaterialPorToken(UUID idMaterial, String token) {
        TaskMaterial material = taskMaterialRepository.findById(idMaterial)
                .orElseThrow(() -> new RuntimeException("Material não encontrado"));

        var claims = tokenService.validateTaskMaterialToken(token);
        if (claims == null) {
            throw new RuntimeException("Token de material inválido.");
        }

        String materialId = claims.get("materialId", String.class);
        String userId = claims.get("userId", String.class);

        if (!idMaterial.toString().equals(materialId)) {
            throw new RuntimeException("Token de material inválido.");
        }

        Task tarefa = material.getTarefa();

        boolean isAlunoDaTurma = tarefa != null
                && tarefa.getTurma() != null
                && tarefa.getTurma().getAlunos() != null
                && tarefa.getTurma().getAlunos().stream().anyMatch(a ->
                a != null && a.getIdUsuario() != null && a.getIdUsuario().toString().equals(userId)
        );

        boolean isProfessorDaTurma = tarefa != null
                && tarefa.getTurma() != null
                && tarefa.getTurma().getProfessor() != null
                && tarefa.getTurma().getProfessor().getIdUsuario() != null
                && tarefa.getTurma().getProfessor().getIdUsuario().toString().equals(userId);

        if (!isAlunoDaTurma && !isProfessorDaTurma) {
            throw new RuntimeException("Token de material inválido.");
        }

        return taskMaterialStorageService.load(material.getArquivoUrl());
    }

    public TaskMaterial buscarMaterialPorToken(UUID idMaterial, String token) {
        carregarArquivoMaterialPorToken(idMaterial, token);
        return taskMaterialRepository.findById(idMaterial)
                .orElseThrow(() -> new RuntimeException("Material não encontrado"));
    }

    public String gerarLinkTemporarioDeMaterial(TaskMaterial material, UUID idUsuario) {
        String token = tokenService.generateTaskMaterialToken(material.getIdMaterial(), idUsuario, 5 * 60 * 1000L);
        return "/api/tarefas/materiais/" + material.getIdMaterial() + "/arquivo/public?token=" + token;
    }

    public String gerarLinkTemporarioDeMaterialAutenticado(UUID idMaterial) {
        User usuario = getUsuarioAutenticado();
        TaskMaterial material = buscarMaterialComPermissao(idMaterial);
        return gerarLinkTemporarioDeMaterial(material, usuario.getIdUsuario());
    }

    private TaskMaterialDTO mapMaterial(TaskMaterial material) {
        return new TaskMaterialDTO(
                material.getIdMaterial(),
                material.getArquivoNome(),
                buildMaterialUrl(material)
        );
    }

    private String buildMaterialUrl(TaskMaterial material) {
        return "/api/tarefas/materiais/" + material.getIdMaterial() + "/arquivo-link";
    }

    public SubmitTask buscarSubmissaoComPermissao(UUID idSubmissao) {
        User usuario = getUsuarioAutenticado();

        SubmitTask submissao = submissaoRepository.findById(idSubmissao)
                .orElseThrow(() -> new RuntimeException("Submissão não encontrada"));

        boolean isAlunoDaSubmissao = submissao.getAluno() != null
                && Objects.equals(submissao.getAluno().getIdUsuario(), usuario.getIdUsuario());

        boolean isProfessorDaTurma = submissao.getTarefa() != null
                && submissao.getTarefa().getTurma() != null
                && submissao.getTarefa().getTurma().getProfessor() != null
                && Objects.equals(
                        submissao.getTarefa().getTurma().getProfessor().getIdUsuario(),
                        usuario.getIdUsuario()
                );

        if (!isAlunoDaSubmissao && !isProfessorDaTurma) {
            throw new RuntimeException("Você não possui acesso a este anexo.");
        }

        return submissao;
    }

    public java.nio.file.Path carregarArquivoSubmissao(UUID idSubmissao) {
        SubmitTask submissao = buscarSubmissaoComPermissao(idSubmissao);
        return submissionStorageService.load(submissao.getArquivoUrl());
    }

    public java.nio.file.Path carregarArquivoSubmissaoPorToken(UUID idSubmissao, String token) {
        SubmitTask submissao = submissaoRepository.findById(idSubmissao)
                .orElseThrow(() -> new RuntimeException("Submissão não encontrada"));

        var claims = tokenService.validateAttachmentToken(token);
        if (claims == null) {
            throw new RuntimeException("Token de anexo inválido.");
        }

        String submissionId = claims.get("submissionId", String.class);
        String userId = claims.get("userId", String.class);

        if (!idSubmissao.toString().equals(submissionId)) {
            throw new RuntimeException("Token de anexo inválido.");
        }

        boolean isAlunoDaSubmissao = submissao.getAluno() != null
                && submissao.getAluno().getIdUsuario() != null
                && submissao.getAluno().getIdUsuario().toString().equals(userId);

        boolean isProfessorDaTurma = submissao.getTarefa() != null
                && submissao.getTarefa().getTurma() != null
                && submissao.getTarefa().getTurma().getProfessor() != null
                && submissao.getTarefa().getTurma().getProfessor().getIdUsuario() != null
                && submissao.getTarefa().getTurma().getProfessor().getIdUsuario().toString().equals(userId);

        if (!isAlunoDaSubmissao && !isProfessorDaTurma) {
            throw new RuntimeException("Token de anexo inválido.");
        }

        return submissionStorageService.load(submissao.getArquivoUrl());
    }

    public SubmitTask buscarSubmissaoPorToken(UUID idSubmissao, String token) {
        carregarArquivoSubmissaoPorToken(idSubmissao, token);
        return submissaoRepository.findById(idSubmissao)
                .orElseThrow(() -> new RuntimeException("Submissão não encontrada"));
    }

    public String gerarLinkTemporarioDeAnexo(SubmitTask submissao, UUID idUsuario) {
        String token = tokenService.generateAttachmentToken(submissao.getIdSubmit(), idUsuario, 5 * 60 * 1000L);
        return "/api/tarefas/submissoes/" + submissao.getIdSubmit() + "/arquivo/public?token=" + token;
    }

    public String gerarLinkTemporarioDeAnexoAutenticado(UUID idSubmissao) {
        User usuario = getUsuarioAutenticado();
        SubmitTask submissao = buscarSubmissaoComPermissao(idSubmissao);
        return gerarLinkTemporarioDeAnexo(submissao, usuario.getIdUsuario());
    }

    private String buildAttachmentUrl(SubmitTask submissao) {
        return "/api/tarefas/submissoes/" + submissao.getIdSubmit() + "/arquivo-link";
    }
}
