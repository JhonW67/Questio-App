package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.CursoRequestDTO;
import com.questio.questio_backend.dto.CursoUpdateRequestDTO;
import com.questio.questio_backend.dto.DisciplinaRequestDTO;
import com.questio.questio_backend.entity.Curso;
import com.questio.questio_backend.entity.Disciplina;
import com.questio.questio_backend.repository.CursoRepository;
import com.questio.questio_backend.repository.DisciplinaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AcademicServiceTest {

    @Autowired
    private AcademicService academicService;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private DisciplinaRepository disciplinaRepository;

    @Test
    void atualizarCurso_quandoCursoExiste_atualizaCampos() {
        Curso curso = cursoRepository.save(Curso.builder()
                .nome("Engenharia")
                .descricao("Descricao antiga")
                .cargaHoraria(3200)
                .vagas(30)
                .ativo(true)
                .build());

        var atualizado = academicService.atualizarCurso(curso.getIdCurso(), new CursoUpdateRequestDTO(
                "Engenharia de Software",
                "Descricao nova",
                3600,
                40,
                false
        ));

        assertThat(atualizado.nome()).isEqualTo("Engenharia de Software");
        assertThat(atualizado.descricao()).isEqualTo("Descricao nova");
        assertThat(atualizado.cargaHoraria()).isEqualTo(3600);
        assertThat(atualizado.vagas()).isEqualTo(40);
        assertThat(atualizado.ativo()).isFalse();
    }

    @Test
    void criarDisciplina_quandoDuplicadaNoMesmoSemestre_disparaErro() {
        Curso curso = cursoRepository.save(Curso.builder()
                .nome("Engenharia")
                .descricao("Descricao")
                .cargaHoraria(3200)
                .vagas(30)
                .ativo(true)
                .build());

        disciplinaRepository.save(Disciplina.builder()
                .curso(curso)
                .nome("Banco de Dados")
                .semestre(1)
                .cargaHoraria(80)
                .ativa(true)
                .build());

        assertThatThrownBy(() -> academicService.criarDisciplina(
                curso.getIdCurso(),
                new DisciplinaRequestDTO("Banco de Dados", 1, 80)
        )).isInstanceOf(RuntimeException.class)
                .hasMessageContaining("já existe");
    }

    @Test
    void criarCurso_quandoDisciplinasDuplicadas_disparaErro() {
        assertThatThrownBy(() -> academicService.criarCurso(new CursoRequestDTO(
                "Engenharia",
                "Descricao",
                3200,
                30,
                List.of(
                        new DisciplinaRequestDTO("Banco de Dados", 1, 80),
                        new DisciplinaRequestDTO("Banco de Dados", 1, 80)
                )
        ))).isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Disciplina duplicada");
    }
}

