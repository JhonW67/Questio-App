package com.questio.questio_backend.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TurmaOfertaRequestDTO(
        @NotNull UUID idDisciplina,
        @NotNull UUID idProfessor
) {}

