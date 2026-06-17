package com.questio.questio_backend.dto;

import java.util.UUID;

public record TaskMaterialDTO(
        UUID idMaterial,
        String arquivoNome,
        String arquivoUrl
) {}

