-- Tabla padre: todo lo que comparten los 3 tipos
CREATE TABLE medios_pago (
    identificador   SERIAL          NOT NULL,
    cliente         INT             NOT NULL,
    tipo            VARCHAR(20)     NOT NULL
                        CONSTRAINT chkTipo CHECK (tipo IN ('cheque', 'cuenta_bancaria', 'tarjeta_credito')),
    verificado      BOOLEAN         NOT NULL DEFAULT TRUE,
    moneda          VARCHAR(3)      NOT NULL DEFAULT 'ARS'
                        CONSTRAINT chkMonedaMP CHECK (moneda IN ('ARS', 'USD')),
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_medios_pago PRIMARY KEY (identificador),
    CONSTRAINT fk_medios_pago_clientes FOREIGN KEY (cliente) REFERENCES clientes (identificador)
);

-- Hija 1: Cheque certificado
CREATE TABLE medios_pago_cheque (
    identificador       INT             NOT NULL,
    nroCheque           VARCHAR(50)     NOT NULL,
    banco               VARCHAR(150)    NOT NULL,
    montoCertificado    DECIMAL(18,2)   NOT NULL CONSTRAINT chkMontoCheque CHECK (montoCertificado > 0),
    fechaVencimiento    DATE            NOT NULL,
    CONSTRAINT pk_mp_cheque PRIMARY KEY (identificador),
    CONSTRAINT fk_mp_cheque FOREIGN KEY (identificador) REFERENCES medios_pago (identificador)
);

-- Hija 2: Cuenta bancaria
CREATE TABLE medios_pago_cuenta (
    identificador   INT             NOT NULL,
    titular         VARCHAR(150)    NOT NULL,
    banco           VARCHAR(150)    NOT NULL,
    cbu             VARCHAR(50)     NULL,   -- solo bancos locales
    alias           VARCHAR(50)     NULL,
    esExterior      BOOLEAN         NOT NULL DEFAULT FALSE,
    iban            VARCHAR(50)     NULL,
    pais            INT             NULL,
    CONSTRAINT pk_mp_cuenta PRIMARY KEY (identificador),
    CONSTRAINT fk_mp_cuenta         FOREIGN KEY (identificador) REFERENCES medios_pago (identificador),
    CONSTRAINT fk_mp_cuenta_paises  FOREIGN KEY (pais)          REFERENCES paises (numero)
);

-- Hija 3: Tarjeta de crédito
CREATE TABLE medios_pago_tarjeta (
    identificador       INT             NOT NULL,
    titular             VARCHAR(150)    NOT NULL,
    ultimos4            VARCHAR(4)      NOT NULL,
    marca               VARCHAR(20)     NOT NULL
    vencimiento         VARCHAR(7)      NOT NULL,   -- MM/YYYY
    esInternacional     BOOLEAN         NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_mp_tarjeta PRIMARY KEY (identificador),
    CONSTRAINT fk_mp_tarjeta FOREIGN KEY (identificador) REFERENCES medios_pago (identificador)
);