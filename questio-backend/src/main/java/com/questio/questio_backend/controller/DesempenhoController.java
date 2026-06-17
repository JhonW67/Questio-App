package com.questio.questio_backend.controller;

import com.questio.questio_backend.dto.AvaliarSubmissaoRequestDTO;
import com.questio.questio_backend.dto.DesempenhoAlunoDTO;
import com.questio.questio_backend.dto.DesempenhoTurmaDTO;
import com.questio.questio_backend.dto.SubmissaoAvaliadaDTO;
import com.questio.questio_backend.service.DesempenhoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/desempenho")
@RequiredArgsConstructor
public class DesempenhoController {

    private final DesempenhoService desempenhoService;

    @GetMapping("/turmas")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<List<DesempenhoTurmaDTO>> listarTurmasDoProfessor() {
        return ResponseEntity.ok(desempenhoService.listarTurmasDoProfessor());
    }

    @GetMapping("/turmas/{idTurma}")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<List<DesempenhoAlunoDTO>> listarDesempenhoDaTurma(@PathVariable UUID idTurma) {
        return ResponseEntity.ok(desempenhoService.listarDesempenhoDaTurma(idTurma));
    }

    @PatchMapping("/submissoes/{idSubmissao}/avaliar")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<SubmissaoAvaliadaDTO> avaliarSubmissao(
            @PathVariable UUID idSubmissao,
            @RequestBody @Valid AvaliarSubmissaoRequestDTO dto
    ) {
        return ResponseEntity.ok(desempenhoService.avaliarSubmissao(idSubmissao, dto));
    }
}
