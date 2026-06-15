package com.questio.questio_backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record EnrolmentRequestDTO(@NotNull UUID idTurma, @NotEmpty List<UUID> idsAlunos){
}
