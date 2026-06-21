ALTER TABLE notificaciones
    DROP CONSTRAINT chk_tipo_notificacion;

ALTER TABLE notificaciones
    ALTER COLUMN tipo TYPE TEXT;
