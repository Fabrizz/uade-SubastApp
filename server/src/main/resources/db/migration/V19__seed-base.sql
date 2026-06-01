-- INSERT OR UPDATE (upsert) para la tabla sectores
INSERT INTO sectores (identificador, nombresector, codigosector, responsablesector) VALUES
(1, 'sistema', 1, 1)
ON CONFLICT (identificador) DO UPDATE SET
    nombresector      = EXCLUDED.nombresector,
    codigosector      = EXCLUDED.codigosector,
    responsablesector = EXCLUDED.responsablesector;
 
-- INSERT OR UPDATE (upsert) para la tabla empleados
INSERT INTO empleados (identificador, cargo, sector) VALUES
(1, 'sistema', 1)
ON CONFLICT (identificador) DO UPDATE SET
    cargo  = EXCLUDED.cargo,
    sector = EXCLUDED.sector;
 