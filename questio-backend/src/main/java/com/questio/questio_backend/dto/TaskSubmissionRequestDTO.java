package com.questio.questio_backend.dto;

import jakarta.validation.constraints.Size;

public record TaskSubmissionRequestDTO(
        @Size(max = 4000) String resposta
) {
}
