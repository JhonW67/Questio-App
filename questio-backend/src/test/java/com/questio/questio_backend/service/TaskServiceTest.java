package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.TaskRequestDTO;
import com.questio.questio_backend.dto.TaskSubmissionRequestDTO;
import com.questio.questio_backend.entity.Class;
import com.questio.questio_backend.entity.Curso;
import com.questio.questio_backend.entity.Disciplina;
import com.questio.questio_backend.entity.Task;
import com.questio.questio_backend.entity.TurmaOferta;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.entity.enums.TipoUsuario;
import com.questio.questio_backend.repository.ClassRepository;
import com.questio.questio_backend.repository.CursoRepository;
import com.questio.questio_backend.repository.DisciplinaRepository;
import com.questio.questio_backend.repository.SubmitRepository;
import com.questio.questio_backend.repository.TaskMaterialRepository;
import com.questio.questio_backend.repository.TaskRepository;
import com.questio.questio_backend.repository.TurmaOfertaRepository;
import com.questio.questio_backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(properties = "app.upload.dir=target/test-uploads")
@Transactional
class TaskServiceTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private DisciplinaRepository disciplinaRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private SubmitRepository submitRepository;

    @Autowired
    private TaskMaterialRepository taskMaterialRepository;

    @Autowired
    private TurmaOfertaRepository turmaOfertaRepository;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void criarTarefa_quandoTurmaPertenceAoProfessor_criaComSucesso() {
        User professor = salvarProfessor("professor.valido");
        Class turma = salvarTurma("Turma Valida", professor);
        autenticarComo(professor);

        var resposta = taskService.criarTarefa(new TaskRequestDTO(
                "Quiz 1",
                "Resolver atividade da turma",
                LocalDateTime.now().plusDays(3),
                10,
                turma.getIdClass(),
                turma.getDisciplina().getIdDisciplina()
        ));

        assertThat(resposta.titulo()).isEqualTo("Quiz 1");
        assertThat(resposta.objetivo()).isEqualTo("Resolver atividade da turma");
        assertThat(resposta.concluida()).isFalse();
    }

    @Test
    void criarTarefa_quandoTurmaNaoPertenceAoProfessor_lancaErro() {
        User professorAutenticado = salvarProfessor("professor.autenticado");
        User outroProfessor = salvarProfessor("professor.outra.turma");
        Class turma = salvarTurma("Turma Restrita", outroProfessor);
        autenticarComo(professorAutenticado);

        assertThatThrownBy(() -> taskService.criarTarefa(new TaskRequestDTO(
                "Quiz Indevido",
                "Tentativa em turma de outro professor",
                LocalDateTime.now().plusDays(2),
                12,
                turma.getIdClass(),
                turma.getDisciplina().getIdDisciplina()
        )))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Você não está vinculado a esta disciplina nesta turma.");
    }

    @Test
    void submeterTarefa_quandoAlunoDaTurma_enviaRespostaEArquivo_persisteSubmissao() {
        User professor = salvarProfessor("professor.submissao");
        User aluno = salvarAluno("aluno.submissao");
        Class turma = salvarTurmaComAluno("Turma Submissao", professor, aluno);
        Task tarefa = taskRepository.save(Task.builder()
                .titulo("Atividade 1")
                .descricao("Descreva a solução")
                .prazo(LocalDateTime.now().plusDays(2))
                .pontos(15)
                .professor(professor)
                .turma(turma)
                .build());
        autenticarComo(aluno);

        MockMultipartFile arquivo = new MockMultipartFile(
                "arquivo",
                "atividade.pdf",
                "application/pdf",
                "conteudo-do-pdf".getBytes()
        );

        var mensagem = taskService.submeterTarefa(
                tarefa.getIdTask(),
                new TaskSubmissionRequestDTO("Minha resposta detalhada da atividade."),
                arquivo
        );

        assertThat(mensagem).contains("15 XP");
        var submissao = submitRepository.findByAluno(aluno).getFirst();
        assertThat(submissao.getResposta()).contains("Minha resposta detalhada");
        assertThat(submissao.getTarefa().getIdTask()).isEqualTo(tarefa.getIdTask());
        assertThat(submissao.getArquivoNome()).isEqualTo("atividade.pdf");
        assertThat(submissao.getArquivoUrl()).isNotBlank();
    }

    @Test
    void anexarMateriais_quandoProfessorDaTurma_salvaMaterialEAlunoEnxergaNoListing() {
        User professor = salvarProfessor("professor.material");
        User aluno = salvarAluno("aluno.material");
        Class turma = salvarTurmaComAluno("Turma Materiais", professor, aluno);

        autenticarComo(professor);
        var tarefaCriada = taskService.criarTarefa(new TaskRequestDTO(
                "Atividade com materiais",
                "Leia os PDFs e responda",
                LocalDateTime.now().plusDays(2),
                10,
                turma.getIdClass(),
                turma.getDisciplina().getIdDisciplina()
        ));

        MockMultipartFile material = new MockMultipartFile(
                "arquivos",
                "material.pdf",
                "application/pdf",
                "conteudo-material".getBytes()
        );

        var materiais = taskService.anexarMateriais(tarefaCriada.id(), java.util.List.of(material));

        assertThat(materiais).hasSize(1);
        assertThat(materiais.getFirst().arquivoNome()).isEqualTo("material.pdf");
        assertThat(materiais.getFirst().arquivoUrl()).contains("/api/tarefas/materiais/");

        assertThat(taskMaterialRepository.findByTarefaIdTaskOrderByEnviadoEmAsc(tarefaCriada.id())).hasSize(1);

        autenticarComo(aluno);
        var tarefas = taskService.listarTarefasDoAluno();
        var tarefaAluno = tarefas.stream()
                .filter(t -> t.id().equals(tarefaCriada.id()))
                .findFirst()
                .orElseThrow();

        assertThat(tarefaAluno.materiais()).isNotNull();
        assertThat(tarefaAluno.materiais()).hasSize(1);
        assertThat(tarefaAluno.materiais().getFirst().arquivoNome()).isEqualTo("material.pdf");
    }

    private User salvarProfessor(String prefixoEmail) {
        return userRepository.save(User.builder()
                .nome("Professor Teste")
                .email(prefixoEmail + "." + System.nanoTime() + "@questio.com")
                .senha("senha")
                .curso("Engenharia de Software")
                .tipoUsuario(TipoUsuario.PROFESSOR.getValor())
                .termoAceito(true)
                .build());
    }

    private User salvarAluno(String prefixoEmail) {
        return userRepository.save(User.builder()
                .nome("Aluno Teste")
                .email(prefixoEmail + "." + System.nanoTime() + "@questio.com")
                .senha("senha")
                .curso("Engenharia de Software")
                .tipoUsuario(TipoUsuario.ALUNO.getValor())
                .termoAceito(true)
                .build());
    }

    private Class salvarTurma(String nomeTurma, User professor) {
        Curso curso = cursoRepository.save(Curso.builder()
                .nome("Curso Teste " + System.nanoTime())
                .descricao("Curso para teste")
                .cargaHoraria(3200)
                .vagas(30)
                .build());

        Disciplina disciplina = disciplinaRepository.save(Disciplina.builder()
                .curso(curso)
                .nome("Disciplina Teste " + System.nanoTime())
                .semestre(1)
                .cargaHoraria(80)
                .build());

        Class turma = classRepository.save(Class.builder()
                .nome(nomeTurma)
                .professor(professor)
                .curso(curso)
                .disciplina(disciplina)
                .semestre(1)
                .build());

        turmaOfertaRepository.save(TurmaOferta.builder()
                .turma(turma)
                .disciplina(disciplina)
                .professor(professor)
                .ativa(true)
                .build());

        return turma;
    }

    private Class salvarTurmaComAluno(String nomeTurma, User professor, User aluno) {
        Class turma = salvarTurma(nomeTurma, professor);
        turma.getAlunos().add(aluno);
        aluno.getTurmas().add(turma);
        userRepository.save(aluno);
        return classRepository.save(turma);
    }

    private void autenticarComo(User user) {
        var authentication = new UsernamePasswordAuthenticationToken(
                user,
                null,
                user.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
