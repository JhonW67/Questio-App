package com.questio.questio_backend.controller;

import com.questio.questio_backend.dto.UserRankingResponseDTO;
import com.questio.questio_backend.dto.UserResponseDTO;
import com.questio.questio_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getProfile() {
        return ResponseEntity.ok(userService.getAuthenticatedUserProfile());
    }

    @GetMapping("/ranking")
    public ResponseEntity<UserRankingResponseDTO> getRanking() {
        return ResponseEntity.ok(userService.getUserRankingStatus());
    }

    @GetMapping("/professores")
    @PreAuthorize("hasAnyRole('COORDENACAO', 'PROFESSOR')")
    public ResponseEntity<List<UserResponseDTO>> listarProfessores() {
        return ResponseEntity.ok(userService.listByTipoUsuario("Professor"));
    }

    @GetMapping("/alunos")
    @PreAuthorize("hasRole('COORDENACAO')")
    public ResponseEntity<List<UserResponseDTO>> listarAlunos() {
        return ResponseEntity.ok(userService.listByTipoUsuario("Aluno"));
    }
}
