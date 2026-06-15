package com.questio.questio_backend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskRequestDTO(
        @NotBlank
        String titulo,

        String descricao,

        @Future
        LocalDateTime prazo,

        @Min(1)
        Integer pontos,

        @NotNull
        UUID idClass
) {}
