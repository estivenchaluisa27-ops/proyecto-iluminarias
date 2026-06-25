export interface Luminaria {
  id: string;
  facultad: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  precision: number | null;
  tipo: string;
  altura_poste: number | null;
  luxes: number | null;
  estado: string;
  etiqueta: string | null;
  edificio: string;
  foto_url: string;
  uuid: string;
  grupo: number | null;
  submitted_by: string;
}

export interface LuminariaStats {
  total: number;
  porTipo: Record<string, number>;
  porEstado: Record<string, number>;
  porFacultad: Record<string, number>;
  conMedicion: number;
  sinMedicion: number;
  luxesPromedio: number;
}

export type EstadoFoco = 'enciende' | 'no enciende' | 'dañado/parpadea';
export type TipoLuminaria = 'led' | 'sodio';

export interface PredictionLuminaria extends Luminaria {
  tipoOriginal: string;
  estadoOriginal: string;
  luxesOriginal: number | null;
}

export interface PredictionStatsData {
  totalLuminarias: number;
  sodioToLed: number;
  reparadas: number;
  luxesPromedioActual: number;
  luxesPromedioPredicho: number;
  mejoraPorcentual: number;
  ahorroEnergeticoEstimado: number;
  porFacultad: Record<string, {
    total: number;
    sodioToLed: number;
    reparadas: number;
    luxesActual: number;
    luxesPredicho: number;
    mejora: number;
  }>;
}

export const LED_AVG_LUX = 68.9;
export const SODIO_AVG_LUX = 64.0;
export const LED_SODIO_FACTOR = LED_AVG_LUX / SODIO_AVG_LUX;

export const FACULTADES: string[] = [
  'Todas las facultades',
  'Ingeniería y ciencias aplicadas',
  'Servicios Generales (Fisica)',
  'Facultad de Ciencias Sociales y Humanas',
  'Facultad de Ingeniería y Ciencias Aplicadas',
  'Facultad de Filosofía y Letras',
  'Facultad Jurisprudencia',
  'Facultad de Ciencias Psicológicas',
  'Facultad de Comunicación Social',
  'Facultad de Ingenieria Química',
  'Facultad de Odontología',
  'Facultad de Cultura Física',
  'Facultad de Ciencias Administrativas',
  'Facultad de Ciencias Económicas',
  'Facultad de Arquitectura y Urbanismo',
  'Facultad de Artes',
  'Facultad de Ciencias',
];
