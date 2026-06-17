package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.CursoRequestDTO;
import com.questio.questio_backend.dto.CursoResponseDTO;
import com.questio.questio_backend.dto.CursoUpdateRequestDTO;
import com.questio.questio_backend.dto.DisciplinaRequestDTO;
import com.questio.questio_backend.dto.DisciplinaResponseDTO;
import com.questio.questio_backend.entity.Curso;
import com.questio.questio_backend.entity.Disciplina;
import com.questio.questio_backend.repository.CursoRepository;
import com.questio.questio_backend.repository.DisciplinaRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AcademicService {

    private final CursoRepository cursoRepository;
    private final DisciplinaRepository disciplinaRepository;

    @Transactional
    public List<CursoResponseDTO> listarCursos() {
        return cursoRepository.findAllByOrderByNomeAsc().stream()
                .map(this::mapCurso)
                .toList();
    }

    public List<DisciplinaResponseDTO> listarDisciplinas(UUID idCurso, Integer semestre) {
        List<Disciplina> disciplinas = semestre == null
                ? disciplinaRepository.findByCursoIdCursoOrderBySemestreAscNomeAsc(idCurso)
                : disciplinaRepository.findByCursoIdCursoAndSemestreOrderByNomeAsc(idCurso, semestre);

        return disciplinas.stream()
                .map(this::mapDisciplina)
                .toList();
    }

    @Transactional
    public CursoResponseDTO criarCurso(CursoRequestDTO dto) {
        Curso curso = Curso.builder()
                .nome(dto.nome())
                .descricao(dto.descricao())
                .cargaHoraria(dto.cargaHoraria())
                .vagas(dto.vagas())
                .ativo(true)
                .build();

        if (dto.disciplinas() != null) {
            Set<String> uniqueKeys = new HashSet<>();
            dto.disciplinas().forEach(item -> {
                String key = item.semestre() + "|" + item.nome().trim().toLowerCase(Locale.ROOT);
                if (!uniqueKeys.add(key)) {
                    throw new RuntimeException("Disciplina duplicada para o mesmo semestre.");
                }
            });

            dto.disciplinas().forEach(item -> curso.getDisciplinas().add(
                    Disciplina.builder()
                            .curso(curso)
                            .nome(item.nome())
                            .semestre(item.semestre())
                            .cargaHoraria(item.cargaHoraria())
                            .ativa(true)
                            .build()
            ));
        }

        return mapCurso(cursoRepository.save(curso));
    }

    @Transactional
    public DisciplinaResponseDTO criarDisciplina(UUID idCurso, DisciplinaRequestDTO dto) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

        if (disciplinaRepository.existsByCursoIdCursoAndSemestreAndNomeIgnoreCase(
                idCurso,
                dto.semestre(),
                dto.nome().trim()
        )) {
            throw new RuntimeException("Essa disciplina já existe para o mesmo semestre.");
        }

        Disciplina disciplina = Disciplina.builder()
                .curso(curso)
                .nome(dto.nome())
                .semestre(dto.semestre())
                .cargaHoraria(dto.cargaHoraria())
                .ativa(true)
                .build();

        return mapDisciplina(disciplinaRepository.save(disciplina));
    }

    @Transactional
    public CursoResponseDTO atualizarCurso(UUID idCurso, CursoUpdateRequestDTO dto) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

        curso.setNome(dto.nome());
        curso.setDescricao(dto.descricao());
        curso.setCargaHoraria(dto.cargaHoraria());
        curso.setVagas(dto.vagas());
        if (dto.ativo() != null) {
            curso.setAtivo(dto.ativo());
        }

        return mapCurso(cursoRepository.save(curso));
    }

    private CursoResponseDTO mapCurso(Curso curso) {
        return new CursoResponseDTO(
                curso.getIdCurso(),
                curso.getNome(),
                curso.getDescricao(),
                curso.getCargaHoraria(),
                curso.getVagas(),
                Boolean.TRUE.equals(curso.getAtivo()),
                curso.getDisciplinas().stream()
                        .map(this::mapDisciplina)
                        .sorted((a, b) -> {
                            int semestreCompare = Integer.compare(a.semestre(), b.semestre());
                            return semestreCompare != 0 ? semestreCompare : a.nome().compareToIgnoreCase(b.nome());
                        })
                        .toList()
        );
    }

    private DisciplinaResponseDTO mapDisciplina(Disciplina disciplina) {
        return new DisciplinaResponseDTO(
                disciplina.getIdDisciplina(),
                disciplina.getCurso().getIdCurso(),
                disciplina.getNome(),
                disciplina.getSemestre(),
                disciplina.getCargaHoraria(),
                Boolean.TRUE.equals(disciplina.getAtiva())
        );
    }
}
