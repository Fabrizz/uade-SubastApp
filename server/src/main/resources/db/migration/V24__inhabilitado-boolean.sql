-- Agrega la columna boolean 'inhabilitado' a la tabla clientes_extra
ALTER TABLE clientes_extra ADD COLUMN inhabilitado BOOLEAN NOT NULL DEFAULT FALSE;
