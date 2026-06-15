package com.questio.questio_backend.dto;

import java.util.List;

public record UserRankingResponseDTO(List<RankingDTO> top10, RankingDTO usuarioAtual) {

}