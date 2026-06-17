package com.questio.questio_backend.controller;

import com.questio.questio_backend.dto.TaskRequestDTO;
import com.questio.questio_backend.dto.TaskMaterialDTO;
import com.questio.questio_backend.dto.TaskResponseDTO;
import com.questio.questio_backend.dto.TaskSubmissionRequestDTO;
import com.questio.questio_backend.entity.SubmitTask;
import com.questio.questio_backend.entity.TaskMaterial;
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
        String mensagem = tarefaService.submeterTarefaRapida(id);
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

    @GetMapping("/submissoes/{idSubmissao}/arquivo-link")
    public ResponseEntity<Map<String, String>> gerarLinkTemporarioDeArquivo(@PathVariable UUID idSubmissao) {
        return ResponseEntity.ok(Map.of("url", tarefaService.gerarLinkTemporarioDeAnexoAutenticado(idSubmissao)));
    }

    @GetMapping("/submissoes/{idSubmissao}/arquivo/public")
    public ResponseEntity<FileSystemResource> baixarArquivoSubmissaoPublico(
            @PathVariable UUID idSubmissao,
            @RequestParam("token") String token
    ) {
        SubmitTask submissao = tarefaService.buscarSubmissaoPorToken(idSubmissao, token);
        var path = tarefaService.carregarArquivoSubmissaoPorToken(idSubmissao, token);
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

    @PostMapping(path = "/{id}/materiais/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<List<TaskMaterialDTO>> anexarMateriais(
            @PathVariable UUID id,
            @RequestPart(name = "arquivos", required = false) List<MultipartFile> arquivos
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tarefaService.anexarMateriais(id, arquivos));
    }

    @GetMapping("/{id}/materiais")
    @PreAuthorize("hasAnyRole('ALUNO', 'PROFESSOR')")
    public ResponseEntity<List<TaskMaterialDTO>> listarMateriais(@PathVariable UUID id) {
        return ResponseEntity.ok(tarefaService.listarMateriais(id));
    }

    @GetMapping("/materiais/{idMaterial}/arquivo-link")
    @PreAuthorize("hasAnyRole('ALUNO', 'PROFESSOR')")
    public ResponseEntity<Map<String, String>> gerarLinkTemporarioDeMaterial(@PathVariable UUID idMaterial) {
        return ResponseEntity.ok(Map.of("url", tarefaService.gerarLinkTemporarioDeMaterialAutenticado(idMaterial)));
    }

    @GetMapping("/materiais/{idMaterial}/arquivo/public")
    public ResponseEntity<FileSystemResource> baixarArquivoMaterialPublico(
            @PathVariable UUID idMaterial,
            @RequestParam("token") String token
    ) {
        TaskMaterial material = tarefaService.buscarMaterialPorToken(idMaterial, token);
        var path = tarefaService.carregarArquivoMaterialPorToken(idMaterial, token);
        FileSystemResource resource = new FileSystemResource(path);
        MediaType mediaType = MediaTypeFactory.getMediaType(resource)
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(material.getArquivoNome() != null ? material.getArquivoNome() : resource.getFilename())
                                .build()
                                .toString()
                )
                .body(resource);
    }
}
