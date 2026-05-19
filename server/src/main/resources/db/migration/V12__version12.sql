CREATE TABLE notificaciones (
    identificador   SERIAL          NOT NULL,
    destinatario    INT             NOT NULL,
    titulo          VARCHAR(150)    NOT NULL,
    descripcion     TEXT            NOT NULL,   -- soporta markdown
    fecha           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accion          VARCHAR(500)    NULL,        -- href o deep link
    imagen          VARCHAR(500)    NULL,        -- href de la imagen
    tipo            VARCHAR(30)     NOT NULL
                        CONSTRAINT chk_tipo_notificacion CHECK (tipo IN (
                            'info',
                            'exito',
                            'advertencia',
                            'error',
                            'subasta',
                            'pago',
                            'envio'
                        )),
    leida           BOOLEAN         NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_notificaciones PRIMARY KEY (identificador),
    CONSTRAINT fk_notificaciones_personas FOREIGN KEY (destinatario) REFERENCES personas (identificador)
);