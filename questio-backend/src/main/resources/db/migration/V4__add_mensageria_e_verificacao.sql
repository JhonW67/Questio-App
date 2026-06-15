

ALTER TABLE usuarios ADD COLUMN email_verificado BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE password_reset_tokens (
                                       id UUID PRIMARY KEY,
                                       token VARCHAR(255) NOT NULL UNIQUE,
                                       id_usuario UUID NOT NULL,
                                       data_expiracao TIMESTAMP NOT NULL,
                                       CONSTRAINT fk_reset_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE verification_tokens (
                                     id UUID PRIMARY KEY,
                                     token VARCHAR(255) NOT NULL UNIQUE,
                                     id_usuario UUID NOT NULL,
                                     data_expiracao TIMESTAMP NOT NULL,
                                     CONSTRAINT fk_verify_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);
