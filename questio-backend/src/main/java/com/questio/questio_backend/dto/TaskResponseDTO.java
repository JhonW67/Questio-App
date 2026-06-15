package com.questio.questio_backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskResponseDTO(
        UUID id,
        String titulo,
        String objetivo,
        LocalDateTime dataEntrega,
        boolean concluida,
        Integer pontos
) {}