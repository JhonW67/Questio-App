package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.LoginRequestDTO;
import com.questio.questio_backend.dto.UserRankingResponseDTO;
import com.questio.questio_backend.dto.UserRegisterRequestDTO;
import com.questio.questio_backend.dto.UserResponseDTO;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserResponseDTO registerNewUser (UserRegisterRequestDTO request);

    UserResponseDTO getUserProfile (UUID userId);

    UserResponseDTO updateStreak(UUID userId, Integer novosPontos);

    Object login(@Valid LoginRequestDTO data);
    UserResponseDTO getAuthenticatedUserProfile();
    UserRankingResponseDTO getUserRankingStatus();
    UserResponseDTO setAcessoBloqueado(UUID userId, boolean bloqueado);
    void touchUltimaAtividade(UUID userId);
    List<UserResponseDTO> listByTipoUsuario(String tipoUsuario);
}
