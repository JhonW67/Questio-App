package com.questio.questio_backend.controller;

import com.questio.questio_backend.dto.ClassRequestDTO;
import com.questio.questio_backend.dto.ClassResponseDTO;
import com.questio.questio_backend.dto.AcessoRequestDTO;
import com.questio.questio_backend.dto.EnrolmentRequestDTO;
import com.questio.questio_backend.service.ClassService;
import com.questio.questio_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coordenacao")
@RequiredArgsConstructor
public class CoordinationController {
    private final ClassService turmaService;
    private final UserService userService;

    @PostMapping("/matricular-alunos")
    @PreAuthorize("hasRole('COORDENACAO')")
    public ResponseEntity<String> matricular(@RequestBody @Valid EnrolmentRequestDTO dto) {
        turmaService.matricularAlunos(dto);
        return ResponseEntity.ok("Alunos matriculados com sucesso na turma!");
    }

    @PostMapping("/turmas")
    @PreAuthorize("hasRole('COORDENACAO')")
    public ResponseEntity<ClassResponseDTO> criarTurma(@RequestBody @Valid ClassRequestDTO dto) {
        return ResponseEntity.ok(turmaService.criarTurma(dto));
    }

    @GetMapping("/turmas")
    @PreAuthorize("hasAnyRole('COORDENACAO', 'PROFESSOR')")
    public ResponseEntity<java.util.List<ClassResponseDTO>> listarTurmas() {
        return ResponseEntity.ok(turmaService.listarTurmasVisiveis());
    }

    @DeleteMapping("/turmas/{idTurma}")
    @PreAuthorize("hasRole('COORDENACAO')")
    public ResponseEntity<Void> deletarTurma(@PathVariable java.util.UUID idTurma) {
        turmaService.deletarTurma(idTurma);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/usuarios/{idUsuario}/acesso")
    @PreAuthorize("hasRole('COORDENACAO')")
    public ResponseEntity<Object> atualizarAcesso(
            @PathVariable java.util.UUID idUsuario,
            @RequestBody @Valid AcessoRequestDTO dto
    ) {
        return ResponseEntity.ok(userService.setAcessoBloqueado(idUsuario, Boolean.TRUE.equals(dto.acessoBloqueado())));
    }

}
