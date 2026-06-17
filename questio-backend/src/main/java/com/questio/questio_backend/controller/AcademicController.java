package com.questio.questio_backend.controller;

import com.questio.questio_backend.dto.CursoRequestDTO;
import com.questio.questio_backend.dto.CursoResponseDTO;
import com.questio.questio_backend.dto.CursoUpdateRequestDTO;
import com.questio.questio_backend.dto.DisciplinaRequestDTO;
import com.questio.questio_backend.dto.DisciplinaResponseDTO;
import com.questio.questio_backend.service.AcademicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/academic")
@RequiredArgsConstructor
public class AcademicController {

    private final AcademicService academicService;

    @GetMapping("/cursos")
    public ResponseEntity<List<CursoResponseDTO>> listarCursos() {
        return ResponseEntity.ok(academicService.listarCursos());
    }

    @GetMapping("/cursos/{idCurso}/disciplinas")
    public ResponseEntity<List<DisciplinaResponseDTO>> listarDisciplinas(
            @PathVariable UUID idCurso,
            @RequestParam(required = false) Integer semestre
    ) {
        return ResponseEntity.ok(academicService.listarDisciplinas(idCurso, semestre));
    }

    @PostMapping("/cursos")
    @PreAuthorize("hasRole('COORDENACAO')")
    public ResponseEntity<CursoResponseDTO> criarCurso(@RequestBody @Valid CursoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicService.criarCurso(dto));
    }

    @PostMapping("/cursos/{idCurso}/disciplinas")
    @PreAuthorize("hasRole('COORDENACAO')")
    public ResponseEntity<DisciplinaResponseDTO> criarDisciplina(
            @PathVariable UUID idCurso,
            @RequestBody @Valid DisciplinaRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicService.criarDisciplina(idCurso, dto));
    }

    @PutMapping("/cursos/{idCurso}")
    @PreAuthorize("hasRole('COORDENACAO')")
    public ResponseEntity<CursoResponseDTO> atualizarCurso(
            @PathVariable UUID idCurso,
            @RequestBody @Valid CursoUpdateRequestDTO dto
    ) {
        return ResponseEntity.ok(academicService.atualizarCurso(idCurso, dto));
    }
}
