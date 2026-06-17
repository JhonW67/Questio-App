package com.questio.questio_backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record TurmaCreateRequestDTO(
        @NotBlank String nome,
        @NotNull UUID idCurso,
        @NotNull @Min(1) @Max(10) Integer semestre,
        @Valid List<TurmaOfertaRequestDTO> ofertas
) {}

