package com.questio.questio_backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record SubmissaoAvaliadaDTO(
        UUID idSubmissao,
        Float nota,
        String feedback,
        LocalDateTime avaliadoEm
) {
}
