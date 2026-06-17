package com.questio.questio_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.UUID;

public record ClassRequestDTO(
        @NotBlank String nome,
        @NotNull UUID idProfessor,
        @NotNull UUID idCurso,
        @NotNull UUID idDisciplina,
        @NotNull @Min(1) @Max(10) Integer semestre
) {}
