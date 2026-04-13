-- ============================================================
--  Estructura de Base de Datos - PostgreSQL
--  Convertido desde SQL Server
--  Cambios aplicados:
--    · GO eliminado (no aplica en PostgreSQL)
--    · IDENTITY  →  SERIAL
--    · varbinary(max)  →  BYTEA
--    · dateAdd(dd,10,getdate())  →  CURRENT_DATE + INTERVAL '10 days'
--    · Punto en seguros.nroPoliza corregido a coma
--    · Tildes en nombres de columna (verificación) normalizadas
-- ============================================================

CREATE TABLE paises (
    numero          INT             NOT NULL,
    nombre          VARCHAR(250)    NOT NULL,
    nombreCorto     VARCHAR(250)    NULL,
    capital         VARCHAR(250)    NOT NULL,
    nacionalidad    VARCHAR(250)    NOT NULL,
    idiomas         VARCHAR(150)    NOT NULL,
    CONSTRAINT pk_paises PRIMARY KEY (numero)
);

CREATE TABLE personas (
    identificador   SERIAL          NOT NULL,
    documento       VARCHAR(20)     NOT NULL,
    nombre          VARCHAR(150)    NOT NULL,
    direccion       VARCHAR(250),
    estado          VARCHAR(15)     CONSTRAINT chkEstado CHECK (estado IN ('activo', 'inactivo')),
    foto            BYTEA,
    CONSTRAINT pk_personas PRIMARY KEY (identificador)
);

CREATE TABLE empleados (
    identificador   INT             NOT NULL,
    cargo           VARCHAR(100),
    sector          INT             NULL,
    CONSTRAINT pk_empleados PRIMARY KEY (identificador)
);

CREATE TABLE sectores (
    identificador       SERIAL          NOT NULL,
    nombreSector        VARCHAR(150)    NOT NULL,
    codigoSector        VARCHAR(10)     NULL,
    responsableSector   INT             NULL,
    CONSTRAINT pk_sectores PRIMARY KEY (identificador),
    CONSTRAINT fk_sectores_empleados FOREIGN KEY (responsableSector) REFERENCES empleados (identificador)
);

-- Nota: se corrigió el punto '.' por coma ',' en nroPoliza (error en el original)
CREATE TABLE seguros (
    nroPoliza           VARCHAR(30)     NOT NULL,
    compania            VARCHAR(150)    NOT NULL,
    polizaCombinada     VARCHAR(2)      CONSTRAINT chkPolizaCombinada CHECK (polizaCombinada IN ('si', 'no')),
    importe             DECIMAL(18,2)   NOT NULL CONSTRAINT chkImporte CHECK (importe > 0),
    CONSTRAINT pk_seguro PRIMARY KEY (nroPoliza)
);

CREATE TABLE clientes (
    identificador   INT             NOT NULL,
    numeroPais      INT,
    admitido        VARCHAR(2)      CONSTRAINT chkAdmitido CHECK (admitido IN ('si', 'no')),
    categoria       VARCHAR(10)     CONSTRAINT chkCategoria CHECK (categoria IN ('comun', 'especial', 'plata', 'oro', 'platino')),
    verificador     INT             NOT NULL,
    CONSTRAINT pk_clientes PRIMARY KEY (identificador),
    CONSTRAINT fk_clientes_personas  FOREIGN KEY (identificador) REFERENCES personas (identificador),
    CONSTRAINT fk_clientes_empleados FOREIGN KEY (verificador)   REFERENCES empleados (identificador),
    CONSTRAINT fk_clientes_paises    FOREIGN KEY (numeroPais)    REFERENCES paises (numero)
);

-- Nota: 'verificación' normalizado a 'verificacion' (sin tilde) para mayor compatibilidad
CREATE TABLE duenios (
    identificador           INT             NOT NULL,
    numeroPais              INT,
    verificacionFinanciera  VARCHAR(2)      CONSTRAINT chkVF CHECK (verificacionFinanciera IN ('si', 'no')),
    verificacionJudicial    VARCHAR(2)      CONSTRAINT chkVJ CHECK (verificacionJudicial IN ('si', 'no')),
    calificacionRiesgo      INT             CONSTRAINT chkCR CHECK (calificacionRiesgo IN (1, 2, 3, 4, 5, 6)),
    verificador             INT             NOT NULL,
    CONSTRAINT pk_duenios PRIMARY KEY (identificador),
    CONSTRAINT fk_duenios_personas  FOREIGN KEY (identificador) REFERENCES personas (identificador),
    CONSTRAINT fk_duenios_empleados FOREIGN KEY (verificador)   REFERENCES empleados (identificador)
);

CREATE TABLE subastadores (
    identificador   INT             NOT NULL,
    matricula       VARCHAR(15),
    region          VARCHAR(50),
    CONSTRAINT pk_subastadores PRIMARY KEY (identificador),
    CONSTRAINT fk_subastadores_personas FOREIGN KEY (identificador) REFERENCES personas (identificador)
);

-- Nota: el CHECK de fecha usa CURRENT_DATE (equivalente a getdate() de SQL Server)
CREATE TABLE subastas (
    identificador       SERIAL          NOT NULL,
    fecha               DATE            CONSTRAINT chkFecha CHECK (fecha > CURRENT_DATE + INTERVAL '10 days'),
    hora                TIME            NOT NULL,
    estado              VARCHAR(10)     CONSTRAINT chkES CHECK (estado IN ('abierta', 'cerrada')),
    subastador          INT             NULL,
    ubicacion           VARCHAR(350)    NULL,
    capacidadAsistentes INT             NULL,
    tieneDeposito       VARCHAR(2)      CONSTRAINT chkTD CHECK (tieneDeposito IN ('si', 'no')),
    seguridadPropia     VARCHAR(2)      CONSTRAINT chkSP CHECK (seguridadPropia IN ('si', 'no')),
    categoria           VARCHAR(10)     CONSTRAINT chkCS CHECK (categoria IN ('comun', 'especial', 'plata', 'oro', 'platino')),
    CONSTRAINT pk_subastas PRIMARY KEY (identificador),
    CONSTRAINT fk_subastas_subastadores FOREIGN KEY (subastador) REFERENCES subastadores (identificador)
);

CREATE TABLE productos (
    identificador       SERIAL          NOT NULL,
    fecha               DATE,
    disponible          VARCHAR(2)      CONSTRAINT chkD CHECK (disponible IN ('si', 'no')),
    descripcionCatalogo VARCHAR(500)    NULL DEFAULT 'No Posee',
    descripcionCompleta VARCHAR(300)    NOT NULL,
    revisor             INT             NOT NULL,
    duenio              INT             NOT NULL,
    seguro              VARCHAR(30)     NULL,
    CONSTRAINT pk_productos PRIMARY KEY (identificador),
    CONSTRAINT fk_productos_empleados FOREIGN KEY (revisor) REFERENCES empleados (identificador),
    CONSTRAINT fk_productos_duenios   FOREIGN KEY (duenio)  REFERENCES duenios (identificador)
);

CREATE TABLE fotos (
    identificador   SERIAL  NOT NULL,
    producto        INT     NOT NULL,
    foto            BYTEA   NOT NULL,
    CONSTRAINT pk_fotos PRIMARY KEY (identificador),
    CONSTRAINT fk_fotos_productos FOREIGN KEY (producto) REFERENCES productos (identificador)
);

CREATE TABLE catalogos (
    identificador   SERIAL          NOT NULL,
    descripcion     VARCHAR(250)    NOT NULL,
    subasta         INT             NULL,
    responsable     INT             NOT NULL,
    CONSTRAINT pk_catalogos PRIMARY KEY (identificador),
    CONSTRAINT fk_catalogos_empleados FOREIGN KEY (responsable) REFERENCES empleados (identificador),
    CONSTRAINT fk_catalogos_subastas  FOREIGN KEY (subasta)     REFERENCES subastas (identificador)
);

CREATE TABLE itemsCatalogo (
    identificador   SERIAL          NOT NULL,
    catalogo        INT             NOT NULL,
    producto        INT             NOT NULL,
    precioBase      DECIMAL(18,2)   NOT NULL CONSTRAINT chkPB CHECK (precioBase > 0.01),
    comision        DECIMAL(18,2)   NOT NULL CONSTRAINT chkC  CHECK (comision > 0.01),
    subastado       VARCHAR(2)      CONSTRAINT chkS CHECK (subastado IN ('si', 'no')),
    CONSTRAINT pk_itemsCatalogo PRIMARY KEY (identificador),
    CONSTRAINT fk_itemsCatalogo_catalogos FOREIGN KEY (catalogo) REFERENCES catalogos (identificador),
    CONSTRAINT fk_itemsCatalogo_productos FOREIGN KEY (producto)  REFERENCES productos (identificador)
);

CREATE TABLE asistentes (
    identificador   SERIAL  NOT NULL,
    numeroPostor    INT     NOT NULL,
    cliente         INT     NOT NULL,
    subasta         INT     NOT NULL,
    CONSTRAINT pk_asistentes PRIMARY KEY (identificador),
    CONSTRAINT fk_asistentes_clientes FOREIGN KEY (cliente)  REFERENCES clientes (identificador),
    CONSTRAINT fk_asistentes_subasta  FOREIGN KEY (subasta)  REFERENCES subastas (identificador)
);

CREATE TABLE pujos (
    identificador   SERIAL          NOT NULL,
    asistente       INT             NOT NULL,
    item            INT             NOT NULL,
    importe         DECIMAL(18,2)   NOT NULL CONSTRAINT chkI CHECK (importe > 0.01),
    ganador         VARCHAR(2)      CONSTRAINT chkG CHECK (ganador IN ('si', 'no')) DEFAULT 'no',
    CONSTRAINT pk_pujos PRIMARY KEY (identificador),
    CONSTRAINT fk_pujos_asistentes    FOREIGN KEY (asistente) REFERENCES asistentes (identificador),
    CONSTRAINT fk_pujos_itemsCatalogo FOREIGN KEY (item)      REFERENCES itemsCatalogo (identificador)
);

CREATE TABLE registroDeSubasta (
    identificador   SERIAL          NOT NULL,
    subasta         INT             NOT NULL,
    duenio          INT             NOT NULL,
    producto        INT             NOT NULL,
    cliente         INT             NOT NULL,
    importe         DECIMAL(18,2)   NOT NULL CONSTRAINT chkImportePagado   CHECK (importe > 0.01),
    comision        DECIMAL(18,2)   NOT NULL CONSTRAINT chkComisionPagada  CHECK (comision > 0.01),
    CONSTRAINT pk_registroDeSubasta PRIMARY KEY (identificador),
    CONSTRAINT fk_registroDeSubasta_subastas FOREIGN KEY (subasta)  REFERENCES subastas (identificador),
    CONSTRAINT fk_registroDeSubasta_duenios  FOREIGN KEY (duenio)   REFERENCES duenios (identificador),
    CONSTRAINT fk_registroDeSubasta_producto FOREIGN KEY (producto) REFERENCES productos (identificador),
    CONSTRAINT fk_registroDeSubasta_cliente  FOREIGN KEY (cliente)  REFERENCES clientes (identificador)
);


-- ============================================================
--  TABLAS EXTENDIDAS (datos adicionales por requerimientos)
-- ============================================================

-- ------------------------------------------------------------
--  personas_extra
--  Datos de contacto. Aplica a clientes, dueños y empleados.
-- ------------------------------------------------------------
CREATE TABLE personas_extra (
    identificador   INT             NOT NULL,
    email           VARCHAR(250)    NOT NULL,
    telefono        VARCHAR(50)     NULL,
    CONSTRAINT pk_personas_extra PRIMARY KEY (identificador),
    CONSTRAINT fk_personas_extra_personas FOREIGN KEY (identificador) REFERENCES personas (identificador)
);

-- ------------------------------------------------------------
--  clientes_extra
--  Estado legal y operativo. Solo aplica a compradores.
-- ------------------------------------------------------------
CREATE TABLE clientes_extra (
    identificador       INT             NOT NULL,
    -- habilitado: puede operar con normalidad
    -- suspendido: tiene multa pendiente, debe pagarla antes de participar
    -- inhabilitado: caso derivado a justicia, sin acceso a ningún servicio
    estadoOperativo     VARCHAR(15)     NOT NULL DEFAULT 'habilitado'
                            CONSTRAINT chkEstadoOp CHECK (estadoOperativo IN ('habilitado', 'suspendido', 'inhabilitado')),
    multaPendiente      DECIMAL(18,2)   NULL CONSTRAINT chkMulta CHECK (multaPendiente > 0),
    CONSTRAINT pk_clientes_extra PRIMARY KEY (identificador),
    CONSTRAINT fk_clientes_extra_clientes FOREIGN KEY (identificador) REFERENCES clientes (identificador)
);

-- ------------------------------------------------------------
--  productos_extra
--  Datos adicionales del bien: ciclo de vida, obras de arte,
--  declaración de propiedad y piezas múltiples.
-- ------------------------------------------------------------
CREATE TABLE productos_extra (
    identificador           INT             NOT NULL,
    -- Ciclo de vida del bien dentro de la empresa
    estadoBien              VARCHAR(15)     NOT NULL DEFAULT 'recibido'
                                CONSTRAINT chkEstadoBien CHECK (estadoBien IN (
                                    'recibido',       -- llegó a la empresa
                                    'inspeccionado',  -- fue revisado por un empleado
                                    'aceptado',       -- aprobado para subasta
                                    'rechazado',      -- no aceptado, a devolver
                                    'en_subasta',     -- incluido en catálogo activo
                                    'vendido',        -- adjudicado a un comprador
                                    'devuelto'        -- devuelto al dueño
                                )),
    motivoRechazo           VARCHAR(500)    NULL,
    -- El dueño declaró que el bien le pertenece y no tiene impedimentos legales
    declaracionPropiedad    VARCHAR(2)      NOT NULL DEFAULT 'no'
                                CONSTRAINT chkDeclaracion CHECK (declaracionPropiedad IN ('si', 'no')),
    -- Si el bien es un conjunto (ej: juego de té de 18 piezas)
    esPiezaMultiple         VARCHAR(2)      NOT NULL DEFAULT 'no'
                                CONSTRAINT chkPiezaMultiple CHECK (esPiezaMultiple IN ('si', 'no')),
    cantidadPiezas          INT             NULL CONSTRAINT chkCantPiezas CHECK (cantidadPiezas > 1),
    -- Datos específicos de obras de arte u objetos de diseñador
    esObraDeArte            VARCHAR(2)      NOT NULL DEFAULT 'no'
                                CONSTRAINT chkObraDeArte CHECK (esObraDeArte IN ('si', 'no')),
    artista                 VARCHAR(200)    NULL,
    fechaCreacionObra       DATE            NULL,
    historia                TEXT            NULL,   -- contexto, dueños anteriores, curiosidades
    -- Depósito donde se encuentra físicamente el bien
    deposito                VARCHAR(250)    NULL,
    CONSTRAINT pk_productos_extra PRIMARY KEY (identificador),
    CONSTRAINT fk_productos_extra_productos FOREIGN KEY (identificador) REFERENCES productos (identificador)
);

-- ------------------------------------------------------------
--  subastas_extra
--  Moneda, estado detallado y subastas tipo colección.
-- ------------------------------------------------------------
CREATE TABLE subastas_extra (
    identificador       INT             NOT NULL,
    moneda              VARCHAR(3)      NOT NULL DEFAULT 'ARS'
                            CONSTRAINT chkMoneda CHECK (moneda IN ('ARS', 'USD')),
    -- Estado más granular que el flag abierta/cerrada del esquema original
    estadoDetallado     VARCHAR(15)     NOT NULL DEFAULT 'creada'
                            CONSTRAINT chkEstadoDetallado CHECK (estadoDetallado IN (
                                'creada',       -- registrada, aún no publicada
                                'publicada',    -- visible para usuarios, aún no iniciada
                                'en_curso',     -- actualmente activa con pujos
                                'cerrada',      -- finalizada, en proceso de cobro
                                'finalizada'    -- todo liquidado
                            )),
    -- Si la subasta agrupa todos los bienes de un mismo dueño
    esColeccion         VARCHAR(2)      NOT NULL DEFAULT 'no'
                            CONSTRAINT chkEsColeccion CHECK (esColeccion IN ('si', 'no')),
    nombreColeccion     VARCHAR(200)    NULL,   -- ej: "Colección Familia García"
    CONSTRAINT pk_subastas_extra PRIMARY KEY (identificador),
    CONSTRAINT fk_subastas_extra_subastas FOREIGN KEY (identificador) REFERENCES subastas (identificador)
);

-- ------------------------------------------------------------
--  asistencias_actuales
--  Snapshot en tiempo real de qué asistente está conectado
--  a qué subasta en este momento.
--  Un cliente no puede tener más de un registro ACTIVO.
-- ------------------------------------------------------------
CREATE TABLE asistencias_actuales (
    identificador   SERIAL          NOT NULL,
    asistente       INT             NOT NULL,
    estado          VARCHAR(10)     NOT NULL DEFAULT 'activo'
                        CONSTRAINT chkEstadoAsistencia CHECK (estado IN ('activo', 'finalizado')),
    fechaHoraIngreso    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaHoraSalida     TIMESTAMP   NULL,
    CONSTRAINT pk_asistencias_actuales PRIMARY KEY (identificador),
    CONSTRAINT fk_asistencias_actuales_asistentes FOREIGN KEY (asistente) REFERENCES asistentes (identificador)
);
