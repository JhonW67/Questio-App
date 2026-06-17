package com.questio.questio_backend.repository;

import com.questio.questio_backend.entity.AcademicEvent;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface AcademicEventRepository extends JpaRepository<AcademicEvent, UUID> {
    @EntityGraph(attributePaths = {"professor", "aluno", "turma", "disciplina"})
    @Query("""
            select distinct e
            from AcademicEvent e
            where e.professor.idUsuario = :idProfessor
               or exists (
                   select 1
                   from TurmaOferta o
                   where o.turma = e.turma
                     and o.professor.idUsuario = :idProfessor
               )
            order by e.dataEvento desc, e.criadoEm desc
            """)
    List<AcademicEvent> findVisiveisParaProfessor(UUID idProfessor);

    @EntityGraph(attributePaths = {"professor", "aluno", "turma", "disciplina"})
    List<AcademicEvent> findAllByOrderByDataEventoDescCriadoEmDesc();
}
