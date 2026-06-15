package com.questio.questio_backend.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TipoUsuario {
    ALUNO("Aluno"),
    PROFESSOR("Professor"),
    COORDENACAO("Coordenacao");

    private final String valor;

    TipoUsuario(String valor) {
        this.valor = valor;
    }
    
    @JsonValue
    public String getValor(){
        return valor;
    }

    @JsonCreator
    public static TipoUsuario fromString(String value) {
        for (TipoUsuario tipo : TipoUsuario.values()) {
            if (tipo.name().equalsIgnoreCase(value) || tipo.valor.equalsIgnoreCase(value)) {
                return tipo;
            }
        }
        return null;
    }
}
