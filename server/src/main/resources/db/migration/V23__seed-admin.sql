-- Seed del empleado y sector del sistema.
-- Orden: empleado primero (sectores.responsablesector tiene FK a empleados),
-- luego sector, luego se vincula el empleado a su sector.

INSERT INTO empleados (identificador, cargo, sector)
VALUES (1, 'sistema', NULL)
ON CONFLICT (identificador) DO NOTHING;

INSERT INTO sectores (identificador, nombresector, codigosector, responsablesector)
OVERRIDING SYSTEM VALUE
VALUES (1, 'sistema', '1', 1)
ON CONFLICT (identificador) DO UPDATE SET
    nombresector      = EXCLUDED.nombresector,
    codigosector      = EXCLUDED.codigosector,
    responsablesector = EXCLUDED.responsablesector;

SELECT setval('sectores_identificador_seq', GREATEST(1, (SELECT MAX(identificador) FROM sectores)));

UPDATE empleados SET sector = 1 WHERE identificador = 1 AND sector IS NULL;
