package com.questio.questio_backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CursoRequestDTO(
        @NotBlank
        String nome,

        String descricao,

        @Min(1)
        Integer cargaHoraria,

        @Min(1)
        Integer vagas,

        @Valid
        List<DisciplinaRequestDTO> disciplinas
) {}
