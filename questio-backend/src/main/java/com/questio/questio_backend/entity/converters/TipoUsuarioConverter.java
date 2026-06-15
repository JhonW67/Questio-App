package com.questio.questio_backend.entity.converters;

import com.questio.questio_backend.entity.enums.TipoUsuario;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TipoUsuarioConverter implements AttributeConverter<TipoUsuario, String> {

    @Override
    public String convertToDatabaseColumn(TipoUsuario attribute) {
        return attribute == null ? null : attribute.getValor();
    }

    @Override
    public TipoUsuario convertToEntityAttribute(String dbData) {
        return dbData == null ? null : TipoUsuario.fromString(dbData);
    }
}