-- (8) Verificación inicial = false: el medio se crea NO verificado;
-- la empresa lo aprueba con PATCH /verificar (o lo rechaza con /rechazar).
ALTER TABLE medios_pago ALTER COLUMN verificado SET DEFAULT FALSE;

-- (4) Medio de pago elegido por el comprador al cerrarse la venta.
-- Nullable para no romper filas históricas; el service exige no-null en nuevas adjudicaciones.
ALTER TABLE registro_de_subasta_extra
    ADD COLUMN medio_pago_comprador INT NULL,
    ADD CONSTRAINT fk_rse_mp_comprador
        FOREIGN KEY (medio_pago_comprador) REFERENCES medios_pago (identificador);

-- La cuenta de cobro del dueño se define en un flujo separado al cierre,
-- por lo que al crear el extra al marcar al ganador todavía puede no estar definida.
ALTER TABLE registro_de_subasta_extra
    ALTER COLUMN cuenta_cobro_duenio DROP NOT NULL;
