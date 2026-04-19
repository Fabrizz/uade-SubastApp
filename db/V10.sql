CREATE TABLE registro_de_subasta_extra (
    identificador           SERIAL          NOT NULL,
    registro_subasta        INT             NOT NULL,
    cuenta_cobro_duenio     INT             NOT NULL,
    direccion_devolucion    VARCHAR(350)    NULL,
    pais_devolucion         INT             NULL,
    gasto_devolucion        DECIMAL(18,2)   NULL CONSTRAINT chk_gasto_dev CHECK (gasto_devolucion > 0),
    estado_pago_duenio      VARCHAR(15)     NOT NULL DEFAULT 'pendiente'
                                CONSTRAINT chk_estado_pago CHECK (estado_pago_duenio IN (
                                    'pendiente',
                                    'transferido',
                                    'confirmado'
                                )),
    fecha_transferencia     TIMESTAMP       NULL,
    importe_neto            DECIMAL(18,2)   NULL CONSTRAINT chk_importe_neto CHECK (importe_neto > 0),

    CONSTRAINT pk_registro_de_subasta_extra
        PRIMARY KEY (identificador),
    CONSTRAINT fk_rse_registro
        FOREIGN KEY (registro_subasta)    REFERENCES registrodesubasta (identificador),
    CONSTRAINT fk_rse_cuenta
        FOREIGN KEY (cuenta_cobro_duenio) REFERENCES medios_pago_cuenta (identificador),
    CONSTRAINT fk_rse_pais
        FOREIGN KEY (pais_devolucion)     REFERENCES paises (numero),
    CONSTRAINT uq_rse_registro
        UNIQUE (registro_subasta)
);