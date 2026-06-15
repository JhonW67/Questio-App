package com.questio.questio_backend.dto;

import com.questio.questio_backend.entity.enums.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record UserRegisterRequestDTO(

        @NotBlank
        @Size(min = 3, max = 100)
        String nome,

        @NotBlank
        @Email
        String email,

        @NotBlank
        @Size(min = 8, max = 50)
        String senha,

        @Size(max = 100)
        String curso,

        @NotNull(message = "O tipo de usuário é obrigatório")
        TipoUsuario tipoUsuario,

        Boolean termoAceito
) {}