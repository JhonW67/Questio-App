package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.TaskRequestDTO;
import com.questio.questio_backend.entity.Class;
import com.questio.questio_backend.entity.Curso;
import com.questio.questio_backend.entity.Disciplina;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.entity.enums.TipoUsuario;
import com.questio.questio_backend.repository.ClassRepository;
import com.questio.questio_backend.repository.CursoRepository;
import com.questio.questio_backend.repository.DisciplinaRepository;
import com.questio.questio_backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
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
                turma.getIdClass()
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
                turma.getIdClass()
        )))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Você só pode criar tarefas para turmas vinculadas ao seu perfil.");
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

        return classRepository.save(Class.builder()
                .nome(nomeTurma)
                .professor(professor)
                .curso(curso)
                .disciplina(disciplina)
                .semestre(1)
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
