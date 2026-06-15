package com.questio.questio_backend.controller;

import com.questio.questio_backend.dto.ForgotPasswordRequestDTO;
import com.questio.questio_backend.dto.ResetPasswordRequestDTO;
import com.questio.questio_backend.service.PasswordResetServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetServiceImpl resetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody @Valid ForgotPasswordRequestDTO dto) {
        resetService.solicitarReset(dto.email());
        return ResponseEntity.ok("Se o e-mail existir, um link de redefinição foi enviado.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody @Valid ResetPasswordRequestDTO dto) {
        resetService.resetarSenha(dto.token(), dto.novaSenha());
        return ResponseEntity.ok("Senha redefinida com sucesso!");
    }
}
