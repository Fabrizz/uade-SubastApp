export interface DNIData {
  apellido: string;
  nombre: string;
  dni: string;
  sexo: string;
  fechaNacimiento: string;
  fechaVencimiento: string;
  tramite: string;
}

export function parseDNI(raw: string): DNIData {
  // Format: @APELLIDO@NOMBRE@SEXO@DNI@ORDEN@NACIMIENTO@VENCIMIENTO@...
  const fields = raw.split('@').filter(Boolean);

  return {
    apellido: fields[0] ?? '',
    nombre: fields[1] ?? '',
    sexo: fields[2] ?? '',
    dni: fields[3] ?? '',
    tramite: fields[4] ?? '',
    fechaNacimiento: fields[5] ?? '',
    fechaVencimiento: fields[6] ?? '',
  };
}

const APELLIDOS = [
  'GONZALEZ', 'RODRIGUEZ', 'GARCIA', 'FERNANDEZ', 'LOPEZ',
  'MARTINEZ', 'SANCHEZ', 'PEREZ', 'GOMEZ', 'ALVAREZ',
  'DIAZ', 'TORRES', 'RUIZ', 'RAMIREZ', 'FLORES',
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomApellido() {
  return APELLIDOS[randomInt(0, APELLIDOS.length - 1)];
}

export function randomizeDNI(real: DNIData): DNIData {
  const dniBase = real.dni.slice(0, -5);
  const dniSuffix = String(randomInt(0, 99999)).padStart(5, '0');

  const day = String(randomInt(1, 28)).padStart(2, '0');
  const month = String(randomInt(1, 12)).padStart(2, '0');
  const realYear = real.fechaNacimiento.split('/')[2] ?? randomInt(1970, 2000);

  const vencYear = randomInt(2025, 2035);
  const vencMonth = String(randomInt(1, 12)).padStart(2, '0');
  const vencDay = String(randomInt(1, 28)).padStart(2, '0');

  const tramite = String(randomInt(10000000, 99999999));

  return {
    ...real,
    dni: dniBase + dniSuffix,
    apellido: randomApellido(),
    fechaNacimiento: `${day}/${month}/${realYear}`,
    fechaVencimiento: `${vencDay}/${vencMonth}/${vencYear}`,
    tramite,
  };
}