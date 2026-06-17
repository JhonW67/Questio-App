package com.questio.questio_backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;
import com.questio.questio_backend.entity.Class;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClassRepository extends JpaRepository<Class, UUID> {
    @EntityGraph(attributePaths = {"curso", "ofertas", "ofertas.disciplina", "ofertas.professor"})
    List<Class> findAllByOrderByNomeAsc();

    @EntityGraph(attributePaths = {"curso", "ofertas", "ofertas.disciplina", "ofertas.professor"})
    List<Class> findDistinctByOfertasProfessorIdUsuarioOrderByNomeAsc(UUID idProfessor);
}
