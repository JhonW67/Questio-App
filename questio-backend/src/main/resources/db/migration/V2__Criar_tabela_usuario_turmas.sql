
CREATE TABLE usuario_turmas (
                                id_usuario UUID NOT NULL,
                                id_turma UUID NOT NULL,
                                PRIMARY KEY (id_usuario, id_turma),
                                CONSTRAINT fk_matricula_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
                                CONSTRAINT fk_matricula_turma FOREIGN KEY (id_turma) REFERENCES turmas(id_turma) ON DELETE CASCADE
);