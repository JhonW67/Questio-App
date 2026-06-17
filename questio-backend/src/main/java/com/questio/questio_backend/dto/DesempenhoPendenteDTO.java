package com.questio.questio_backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record DesempenhoPendenteDTO(
        UUID idSubmissao,
        UUID idTarefa,
        String titulo,
        LocalDateTime dataEntrega,
        LocalDateTime enviadoEm,
        String status,
        Float nota,
        String feedback
) {
}
