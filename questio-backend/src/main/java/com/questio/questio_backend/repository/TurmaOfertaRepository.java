package com.questio.questio_backend.repository;

import com.questio.questio_backend.entity.TurmaOferta;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TurmaOfertaRepository extends JpaRepository<TurmaOferta, UUID> {
    @EntityGraph(attributePaths = {"turma", "disciplina", "professor", "turma.curso"})
    List<TurmaOferta> findByTurmaIdClassOrderByDisciplinaNomeAsc(UUID idTurma);

    @EntityGraph(attributePaths = {"turma", "disciplina", "professor", "turma.curso"})
    List<TurmaOferta> findByProfessorIdUsuarioOrderByTurmaNomeAsc(UUID idProfessor);

    boolean existsByTurmaIdClassAndDisciplinaIdDisciplina(UUID idTurma, UUID idDisciplina);

    boolean existsByTurmaIdClassAndProfessorIdUsuario(UUID idTurma, UUID idProfessor);

    Optional<TurmaOferta> findByTurmaIdClassAndDisciplinaIdDisciplinaAndProfessorIdUsuario(
            UUID idTurma,
            UUID idDisciplina,
            UUID idProfessor
    );
}
