-- Renombrar direccion_devolucion → direccion_envio (semánticamente es entrega, no devolución)
ALTER TABLE registro_de_subasta_extra
    RENAME COLUMN direccion_devolucion TO direccion_envio;

-- Renombrar pais_devolucion → pais_envio
ALTER TABLE registro_de_subasta_extra
    RENAME COLUMN pais_devolucion TO pais_envio;

ALTER TABLE registro_de_subasta_extra
    DROP COLUMN gasto_devolucion;

-- Agregar costo de envío y medio de envío
ALTER TABLE registro_de_subasta_extra
    ADD COLUMN costo_envio  DECIMAL(18,2)   NULL
                                CONSTRAINT chk_costo_envio CHECK (costo_envio > 0),
    ADD COLUMN medio_envio  VARCHAR(20)     NOT NULL DEFAULT 'RETIRO_DEPOSITO'
                                CONSTRAINT chk_medio_envio CHECK (medio_envio IN (
                                    'ENVIO_DOMICILIO',  -- comprador recibe en su dirección, pierde seguro NO aplica
                                    'RETIRO_DEPOSITO'   -- comprador retira, pierde cobertura del seguro
                                ));