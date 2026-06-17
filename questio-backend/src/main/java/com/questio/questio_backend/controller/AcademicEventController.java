package com.questio.questio_backend.controller;

import com.questio.questio_backend.dto.AcademicEventRequestDTO;
import com.questio.questio_backend.dto.AcademicEventResponseDTO;
import com.questio.questio_backend.service.AcademicEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
public class AcademicEventController {

    private final AcademicEventService academicEventService;

    @PostMapping
    @PreAuthorize("hasRole('COORDENACAO')")
    public ResponseEntity<AcademicEventResponseDTO> criar(@RequestBody @Valid AcademicEventRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicEventService.criar(dto));
    }

    @GetMapping
    @PreAuthorize("hasRole('COORDENACAO')")
    public ResponseEntity<List<AcademicEventResponseDTO>> listarTodos() {
        return ResponseEntity.ok(academicEventService.listarTodos());
    }

    @GetMapping("/professor")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<List<AcademicEventResponseDTO>> listarDoProfessorAutenticado() {
        return ResponseEntity.ok(academicEventService.listarDoProfessorAutenticado());
    }

    @PatchMapping("/{idEvento}/lido")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<AcademicEventResponseDTO> marcarComoLido(@PathVariable UUID idEvento) {
        return ResponseEntity.ok(academicEventService.marcarComoLido(idEvento));
    }
}
