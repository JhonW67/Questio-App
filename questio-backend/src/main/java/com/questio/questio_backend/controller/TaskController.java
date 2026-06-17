package com.questio.questio_backend.controller;

import com.questio.questio_backend.dto.TaskRequestDTO;
import com.questio.questio_backend.dto.TaskResponseDTO;
import com.questio.questio_backend.dto.TaskSubmissionRequestDTO;
import com.questio.questio_backend.entity.SubmitTask;
import com.questio.questio_backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;
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
        String mensagem = tarefaService.submeterTarefa(id, new TaskSubmissionRequestDTO(null), null);
        return ResponseEntity.ok(Map.of("mensagem", mensagem));
    }

    @PostMapping("/{id}/submissoes")
    @PreAuthorize("hasRole('ALUNO')")
    public ResponseEntity<Map<String, String>> criarSubmissao(
            @PathVariable UUID id,
            @RequestBody(required = false) @Valid TaskSubmissionRequestDTO dto
    ) {
        String mensagem = tarefaService.submeterTarefa(id, dto == null ? new TaskSubmissionRequestDTO(null) : dto, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensagem", mensagem));
    }

    @PostMapping(path = "/{id}/submissoes/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ALUNO')")
    public ResponseEntity<Map<String, String>> criarSubmissaoComArquivo(
            @PathVariable UUID id,
            @RequestPart(name = "resposta", required = false) String resposta,
            @RequestPart(name = "arquivo", required = false) MultipartFile arquivo
    ) {
        String mensagem = tarefaService.submeterTarefa(
                id,
                new TaskSubmissionRequestDTO(resposta),
                arquivo
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensagem", mensagem));
    }

    @GetMapping
    @PreAuthorize("hasRole('ALUNO')")
    public ResponseEntity<List<TaskResponseDTO>> listarMinhasTarefas() {
        return ResponseEntity.ok(tarefaService.listarTarefasDoAluno());
    }

    @GetMapping("/submissoes/{idSubmissao}/arquivo")
    public ResponseEntity<FileSystemResource> baixarArquivoSubmissao(@PathVariable UUID idSubmissao) {
        SubmitTask submissao = tarefaService.buscarSubmissaoComPermissao(idSubmissao);
        var path = tarefaService.carregarArquivoSubmissao(idSubmissao);
        FileSystemResource resource = new FileSystemResource(path);
        MediaType mediaType = MediaTypeFactory.getMediaType(resource)
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(submissao.getArquivoNome() != null ? submissao.getArquivoNome() : resource.getFilename())
                                .build()
                                .toString()
                )
                .body(resource);
    }
}
