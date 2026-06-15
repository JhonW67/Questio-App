package com.questio.questio_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ClassRequestDTO(
        @NotBlank String nome,
        @NotNull UUID idProfessor
) {}
