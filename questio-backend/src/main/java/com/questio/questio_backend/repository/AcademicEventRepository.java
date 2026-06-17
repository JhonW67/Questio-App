package com.questio.questio_backend.repository;

import com.questio.questio_backend.entity.AcademicEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AcademicEventRepository extends JpaRepository<AcademicEvent, UUID> {
    List<AcademicEvent> findByProfessorIdUsuarioOrderByDataEventoDescCriadoEmDesc(UUID idProfessor);
    List<AcademicEvent> findAllByOrderByDataEventoDescCriadoEmDesc();
}
