-- Fecha y hora de finalización de la subasta (elegidas por el admin al crear)
ALTER TABLE subastas_extra ADD COLUMN fecha_fin DATE NULL;
ALTER TABLE subastas_extra ADD COLUMN hora_fin  TIME NULL;

-- Item actualmente en subasta y cuándo empezó su slot temporal
ALTER TABLE subastas_extra ADD COLUMN item_actual           INT         NULL;
ALTER TABLE subastas_extra ADD COLUMN inicio_item_actual_ts TIMESTAMPTZ NULL;

ALTER TABLE subastas_extra
    ADD CONSTRAINT fk_se_item_actual
    FOREIGN KEY (item_actual) REFERENCES itemscatalogo(identificador) ON DELETE SET NULL;
