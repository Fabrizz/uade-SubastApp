ALTER TABLE productos_extra
ADD COLUMN titulo VARCHAR(500) NULL;

ALTER TABLE subastas_extra
DROP CONSTRAINT chkEstadoDetallado;

ALTER TABLE subastas_extra
ADD CONSTRAINT chkEstadoDetallado CHECK (estadoDetallado IN (
    'creada',
    'publicada',
    'en_espera',
    'en_curso',
    'cerrada',
    'finalizada'
));

ALTER TABLE itemsCatalogo
ADD COLUMN estadoAceptacion VARCHAR(10) NOT NULL DEFAULT 'espera'
    CONSTRAINT chkEstadoAceptacion CHECK (estadoAceptacion IN ('espera', 'rechazado', 'aceptado'));

/* ENDOPOINTS EN ITEM PARA ACEPTAR / DENEGAR */
/* SUBASTA ESTADO_DETALLADO AGREGAR EN ESPERA */
