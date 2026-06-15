package com.questio.questio_backend.dto;

import com.questio.questio_backend.entity.enums.TipoUsuario;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record UserResponseDTO(
        UUID idUsuario,
        String nome,
        String email,
        String curso,
        TipoUsuario tipoUsuario,
        Boolean termoAceito,
        Integer xpTotal,
        Integer nivel,
        Integer streakAtual,
        Integer maiorStreak,
        LocalDateTime ultimoCheckinEm,
        Boolean acessoBloqueado,
        String mensagem
) {}