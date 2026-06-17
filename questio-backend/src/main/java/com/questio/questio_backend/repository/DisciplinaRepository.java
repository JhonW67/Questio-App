package com.questio.questio_backend.repository;

import com.questio.questio_backend.entity.Disciplina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DisciplinaRepository extends JpaRepository<Disciplina, UUID> {
    List<Disciplina> findByCursoIdCursoOrderBySemestreAscNomeAsc(UUID idCurso);
    List<Disciplina> findByCursoIdCursoAndSemestreOrderByNomeAsc(UUID idCurso, Integer semestre);
}
