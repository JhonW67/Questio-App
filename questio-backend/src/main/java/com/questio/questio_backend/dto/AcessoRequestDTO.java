package com.questio.questio_backend.dto;

import jakarta.validation.constraints.NotNull;

public record AcessoRequestDTO(@NotNull Boolean acessoBloqueado) {}

