package com.questio.questio_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CursoUpdateRequestDTO(
        @NotBlank
        String nome,

        String descricao,

        @Min(1)
        Integer cargaHoraria,

        @Min(1)
        Integer vagas,

        Boolean ativo
) {}

