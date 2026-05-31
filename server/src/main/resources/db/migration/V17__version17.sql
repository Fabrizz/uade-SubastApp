-- Datos de verificación de identidad y categorización del cliente.
-- Solo se modifica clientes_extra (no clientes).

ALTER TABLE clientes_extra
ADD COLUMN foto_documento_frente BYTEA NULL;

ALTER TABLE clientes_extra
ADD COLUMN foto_documento_dorso BYTEA NULL;

-- Categoría asignada por la investigación. La mejora por puntaje nunca baja de acá.
ALTER TABLE clientes_extra
ADD COLUMN categoria_base VARCHAR(15) NULL
    CONSTRAINT chkCategoriaBase CHECK (categoria_base IN ('comun', 'especial', 'plata', 'oro', 'platino'));

-- Puntaje calculado a partir de diversidad de medios de pago y actividad.
ALTER TABLE clientes_extra
ADD COLUMN puntaje INT NULL;
