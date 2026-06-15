package com.questio.questio_backend.dto;

import java.util.UUID;

public record RankingDTO(
        UUID idUsuario,
        String nome,
        int xpTotal,
        int nivel,
        Long posicao
) {}
