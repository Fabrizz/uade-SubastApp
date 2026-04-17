ALTER TABLE productos_extra
    ALTER COLUMN declaracionPropiedad DROP DEFAULT,
    ALTER COLUMN declaracionPropiedad TYPE BOOLEAN USING (declaracionPropiedad = 'si'),
    ALTER COLUMN declaracionPropiedad SET DEFAULT FALSE,

    ALTER COLUMN esPiezaMultiple DROP DEFAULT,
    ALTER COLUMN esPiezaMultiple TYPE BOOLEAN USING (esPiezaMultiple = 'si'),
    ALTER COLUMN esPiezaMultiple SET DEFAULT FALSE,

    ALTER COLUMN esObraDeArte DROP DEFAULT,
    ALTER COLUMN esObraDeArte TYPE BOOLEAN USING (esObraDeArte = 'si'),
    ALTER COLUMN esObraDeArte SET DEFAULT FALSE;

ALTER TABLE productos_extra
    DROP CONSTRAINT chkDeclaracion,
    DROP CONSTRAINT chkPiezaMultiple,
    DROP CONSTRAINT chkObraDeArte;