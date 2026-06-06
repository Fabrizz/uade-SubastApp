-- Extiende los CHECK de categoría para admitir el valor interno 'admin'.

ALTER TABLE clientes DROP CONSTRAINT chkCategoria;
ALTER TABLE clientes ADD CONSTRAINT chkCategoria
    CHECK (categoria IN ('comun', 'especial', 'plata', 'oro', 'platino', 'admin'));

ALTER TABLE clientes_extra DROP CONSTRAINT chkCategoriaBase;
ALTER TABLE clientes_extra ADD CONSTRAINT chkCategoriaBase
    CHECK (categoria_base IN ('comun', 'especial', 'plata', 'oro', 'platino', 'admin'));
