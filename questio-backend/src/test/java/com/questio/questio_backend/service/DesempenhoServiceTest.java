package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.AvaliarSubmissaoRequestDTO;
import com.questio.questio_backend.entity.Class;
import com.questio.questio_backend.entity.Curso;
import com.questio.questio_backend.entity.Disciplina;
import com.questio.questio_backend.entity.SubmitTask;
import com.questio.questio_backend.entity.Task;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.entity.enums.TipoUsuario;
import com.questio.questio_backend.repository.ClassRepository;
import com.questio.questio_backend.repository.CursoRepository;
import com.questio.questio_backend.repository.DisciplinaRepository;
import com.questio.questio_backend.repository.SubmitRepository;
import com.questio.questio_backend.repository.TaskRepository;
import com.questio.questio_backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class DesempenhoServiceTest {

    @Autowired
    private DesempenhoService desempenhoService;

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

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listarDesempenhoDaTurma_quandoAlunoConcluiuTarefa_retornaPendenciaDeAvaliacao() {
        User professor = salvarProfessor("professor.desempenho");
        User aluno = salvarAluno("aluno.desempenho");
        Class turma = salvarTurma("Turma Desempenho", professor, aluno);
        Task tarefa = salvarTarefa(turma, professor, "Entrega 1");
        salvarSubmissao(aluno, tarefa);

        autenticarComo(professor);

        var desempenho = desempenhoService.listarDesempenhoDaTurma(turma.getIdClass());

        assertThat(desempenho).hasSize(1);
        var alunoDesempenho = desempenho.getFirst();
        assertThat(alunoDesempenho.nome()).isEqualTo(aluno.getNome());
        assertThat(alunoDesempenho.tarefasConcluidas()).isEqualTo(1);
        assertThat(alunoDesempenho.tarefasTotal()).isEqualTo(1);
        assertThat(alunoDesempenho.entregasPendentesAvaliacao()).isEqualTo(1);
        assertThat(alunoDesempenho.pendenciasAvaliacao()).hasSize(1);
        assertThat(alunoDesempenho.pendenciasAvaliacao().getFirst().resposta()).contains("Resposta do aluno");
    }

    @Test
    void avaliarSubmissao_quandoProfessorDaTurma_avaliaEPersistiNotaEFeedback() {
        User professor = salvarProfessor("professor.avaliador");
        User aluno = salvarAluno("aluno.avaliado");
        Class turma = salvarTurma("Turma Avaliacao", professor, aluno);
        Task tarefa = salvarTarefa(turma, professor, "Entrega Final");
        SubmitTask submissao = salvarSubmissao(aluno, tarefa);

        autenticarComo(professor);

        var resposta = desempenhoService.avaliarSubmissao(
                submissao.getIdSubmit(),
                new AvaliarSubmissaoRequestDTO(92f, "Excelente estrutura e entrega no prazo.")
        );

        assertThat(resposta.nota()).isEqualTo(92f);
        assertThat(resposta.feedback()).contains("Excelente estrutura");
        assertThat(resposta.avaliadoEm()).isNotNull();

        var desempenho = desempenhoService.listarDesempenhoDaTurma(turma.getIdClass());
        var alunoDesempenho = desempenho.getFirst();
        assertThat(alunoDesempenho.entregasPendentesAvaliacao()).isEqualTo(0);
        assertThat(alunoDesempenho.mediaNotas()).isEqualTo(92f);
    }

    private User salvarProfessor(String prefixoEmail) {
        return userRepository.save(User.builder()
                .nome("Professor Desempenho")
                .email(prefixoEmail + "." + System.nanoTime() + "@questio.com")
                .senha("senha")
                .curso("Engenharia de Software")
                .tipoUsuario(TipoUsuario.PROFESSOR.getValor())
                .termoAceito(true)
                .build());
    }

    private User salvarAluno(String prefixoEmail) {
        return userRepository.save(User.builder()
                .nome("Aluno Desempenho")
                .email(prefixoEmail + "." + System.nanoTime() + "@questio.com")
                .senha("senha")
                .curso("Engenharia de Software")
                .tipoUsuario(TipoUsuario.ALUNO.getValor())
                .termoAceito(true)
                .build());
    }

    private Class salvarTurma(String nomeTurma, User professor, User aluno) {
        Curso curso = cursoRepository.save(Curso.builder()
                .nome("Curso Desempenho " + System.nanoTime())
                .descricao("Curso para teste de desempenho")
                .cargaHoraria(3200)
                .vagas(30)
                .build());

        Disciplina disciplina = disciplinaRepository.save(Disciplina.builder()
                .curso(curso)
                .nome("Disciplina Desempenho " + System.nanoTime())
                .semestre(1)
                .cargaHoraria(80)
                .build());

        var alunos = new HashSet<User>();
        alunos.add(aluno);

        Class turma = classRepository.save(Class.builder()
                .nome(nomeTurma)
                .professor(professor)
                .curso(curso)
                .disciplina(disciplina)
                .semestre(1)
                .alunos(alunos)
                .build());

        aluno.getTurmas().add(turma);
        userRepository.save(aluno);

        return turma;
    }

    private Task salvarTarefa(Class turma, User professor, String titulo) {
        return taskRepository.save(Task.builder()
                .titulo(titulo)
                .descricao("Descricao da tarefa")
                .prazo(LocalDateTime.now().plusDays(2))
                .pontos(10)
                .professor(professor)
                .turma(turma)
                .build());
    }

    private SubmitTask salvarSubmissao(User aluno, Task tarefa) {
        return submitRepository.save(SubmitTask.builder()
                .aluno(aluno)
                .tarefa(tarefa)
                .resposta("Resposta do aluno sobre a atividade.")
                .status("Concluido")
                .enviadoEm(LocalDateTime.now())
                .build());
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
