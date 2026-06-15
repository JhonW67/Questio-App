ALTER TABLE cursos ADD COLUMN id_coordenador UUID;

ALTER TABLE cursos ADD CONSTRAINT fk_curso_coordenador
    FOREIGN KEY (id_coordenador) REFERENCES usuarios(id_usuario) ON DELETE SET NULL;

CREATE TYPE tipo_turno AS ENUM ('Matutino', 'Vespertino', 'Noturno');

ALTER TABLE turmas ADD COLUMN turno tipo_turno NOT NULL DEFAULT 'Matutino';