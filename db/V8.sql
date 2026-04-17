ALTER TABLE subastas_extra
    DROP CONSTRAINT IF EXISTS chkEsColeccion;

ALTER TABLE subastas_extra
    ALTER COLUMN esColeccion DROP DEFAULT;

ALTER TABLE subastas_extra
    ALTER COLUMN esColeccion TYPE BOOLEAN
    USING (LOWER(esColeccion) = 'si');

ALTER TABLE subastas_extra
    ALTER COLUMN esColeccion SET DEFAULT FALSE;

ALTER TABLE subastas_extra
    ALTER COLUMN esColeccion SET NOT NULL;