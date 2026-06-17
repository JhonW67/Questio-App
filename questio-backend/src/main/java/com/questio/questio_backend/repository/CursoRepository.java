package com.questio.questio_backend.repository;

import com.questio.questio_backend.dto.CursoDashboardDTO;
import com.questio.questio_backend.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CursoRepository extends JpaRepository<Curso, UUID> {

    long countByAtivoTrue();
    List<Curso> findAllByOrderByNomeAsc();

    @Query("""
            select new com.questio.questio_backend.dto.CursoDashboardDTO(
                c.idCurso,
                c.nome,
                (select count(u) from User u where u.curso = c.nome)
            )
            from Curso c
            where c.ativo = true
            """)
    List<CursoDashboardDTO> findCursosAtivosComQuantidadeDeAlunos();
}
