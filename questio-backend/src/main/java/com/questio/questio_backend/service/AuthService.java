package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.LoginRequestDTO;
import com.questio.questio_backend.dto.UserRegisterRequestDTO;
import com.questio.questio_backend.dto.UserResponseDTO;
import jakarta.validation.Valid;

import java.util.UUID;

public interface AuthService {
    UserResponseDTO registerNewUser (UserRegisterRequestDTO request);

    UserResponseDTO getUserProfile (UUID userId);

    UserResponseDTO updateStreak(UUID userId, Integer novosPontos);

    Object login(@Valid LoginRequestDTO data);

    void verificarEmail(String tokenString);
}
