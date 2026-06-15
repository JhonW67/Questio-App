package com.questio.questio_backend.controller;

import com.questio.questio_backend.dto.LoginRequestDTO;
import com.questio.questio_backend.dto.UserRegisterRequestDTO;
import com.questio.questio_backend.dto.UserResponseDTO;
import com.questio.questio_backend.service.AuthService;
import com.questio.questio_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody UserRegisterRequestDTO request){

        UserResponseDTO response = userService.registerNewUser(request);

        if(response.idUsuario() != null){
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody @Valid LoginRequestDTO data) {
        return ResponseEntity.ok(userService.login(data));
    }

    @GetMapping("/verificar-email")
    public ResponseEntity<String> verificarEmail(@RequestParam("token") String token) {
        authService.verificarEmail(token);
        return ResponseEntity.ok("Conta ativada com sucesso! Você já pode fazer login.");
    }
}