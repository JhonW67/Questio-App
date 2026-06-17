package com.questio.questio_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AvaliarSubmissaoRequestDTO(
        @NotNull @Min(0) @Max(100) Float nota,
        @Size(max = 2000) String feedback
) {
}
