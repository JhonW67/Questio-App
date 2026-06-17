package com.questio.questio_backend.controller;

import com.questio.questio_backend.dto.TaskRequestDTO;
import com.questio.questio_backend.dto.TaskResponseDTO;
import com.questio.questio_backend.dto.TaskSubmissionRequestDTO;
import com.questio.questio_backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tarefas")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService tarefaService;

    @PostMapping("/criar")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<TaskResponseDTO> criar(@RequestBody @Valid TaskRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tarefaService.criarTarefa(dto));
    }

    @PatchMapping("/{id}/concluir")
    @PreAuthorize("hasRole('ALUNO')")
    public ResponseEntity<Map<String, String>> submeter(@PathVariable UUID id) {
        String mensagem = tarefaService.submeterTarefa(id, new TaskSubmissionRequestDTO(null));
        return ResponseEntity.ok(Map.of("mensagem", mensagem));
    }

    @PostMapping("/{id}/submissoes")
    @PreAuthorize("hasRole('ALUNO')")
    public ResponseEntity<Map<String, String>> criarSubmissao(
            @PathVariable UUID id,
            @RequestBody(required = false) @Valid TaskSubmissionRequestDTO dto
    ) {
        String mensagem = tarefaService.submeterTarefa(id, dto == null ? new TaskSubmissionRequestDTO(null) : dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensagem", mensagem));
    }

    @GetMapping
    @PreAuthorize("hasRole('ALUNO')")
    public ResponseEntity<List<TaskResponseDTO>> listarMinhasTarefas() {
        return ResponseEntity.ok(tarefaService.listarTarefasDoAluno());
    }
}
