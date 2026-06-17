package com.questio.questio_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record AcademicEventRequestDTO(
        @NotNull UUID idProfessor,
        UUID idTurma,
        UUID idDisciplina,
        UUID idAluno,
        @NotBlank String tituloEvento,
        @NotBlank String descricaoEvento,
        @NotNull LocalDateTime dataEvento,
        @NotBlank String tipo
) {}
