ALTER TABLE medios_pago_cuenta
ADD COLUMN tipoDeCuenta VARCHAR(20) NOT NULL DEFAULT 'caja_ahorro',
ADD CONSTRAINT chkTipoDeCuenta
    CHECK (tipoDeCuenta IN ('caja_ahorro', 'cuenta_corriente'));