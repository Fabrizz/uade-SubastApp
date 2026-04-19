ALTER TABLE productos_extra
    DROP CONSTRAINT chkEstadoBien;

ALTER TABLE productos_extra
    ADD CONSTRAINT chkEstadoBien CHECK (estadoBien IN (
        'recibido',           -- llegó a la empresa
        'inspeccionado',      -- fue revisado por un empleado
        'aceptado',           -- aprobado para subasta, pendiente aceptación del dueño
        'rechazado',          -- no aceptado por la empresa, a devolver
        'rechazado_cliente',  -- aceptado por empresa pero dueño rechazó base/comisión
        'en_subasta',         -- incluido en catálogo activo
        'vendido',            -- adjudicado a un comprador
        'devuelto'            -- devuelto al dueño (cubre ambos rechazos)
    ));

ALTER TABLE medios_pago_cuenta
    ADD COLUMN swift VARCHAR(20) NULL;