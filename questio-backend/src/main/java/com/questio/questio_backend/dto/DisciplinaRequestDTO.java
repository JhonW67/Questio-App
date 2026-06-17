package com.questio.questio_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record DisciplinaRequestDTO(
        @NotBlank
        String nome,

        @Min(1)
        @Max(10)
        Integer semestre,

        @Min(1)
        Integer cargaHoraria
) {}
