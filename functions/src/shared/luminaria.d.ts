export interface Luminaria {
    id: string | number;
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
