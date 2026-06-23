import pandas as pd
import json
import math

ARCHIVO_EXCEL = 'mediciones.xlsx'
ARCHIVO_SALIDA = '../backend/data/luminarias.json'

COL_MAP = {
    '_id': 'id',
    'Facultad/Sector': 'facultad',
    '_Coordenadas GPS_latitude': 'latitude',
    '_Coordenadas GPS_longitude': 'longitude',
    '_Coordenadas GPS_altitude': 'altitude',
    '_Coordenadas GPS_precision': 'precision',
    'Tipo de Luminaria ': 'tipo',
    'Altura del poste ': 'altura_poste',
    'Medición de luxes ': 'luxes',
    'Estado del foco': 'estado',
    'Etiqueta del poste': 'etiqueta',
    '¿Esta en un edificio?': 'edificio',
    'Foto del poste _URL': 'foto_url',
    '_uuid': 'uuid',
    'Número de grupo ': 'grupo',
    '_submitted_by': 'submitted_by',
}

def safe_int(v):
    try:
        if pd.isna(v):
            return None
        return int(float(v))
    except (ValueError, TypeError, OverflowError):
        return None

def safe_float(v):
    try:
        if pd.isna(v):
            return None
        v = float(v)
        if math.isnan(v) or math.isinf(v):
            return None
        return v
    except (ValueError, TypeError):
        return None

def safe_str(v):
    if pd.isna(v):
        return None
    s = str(v).strip()
    return s if s else None

def normalize_tipo(v):
    t = safe_str(v)
    if t is None:
        return 'desconocido'
    t = t.lower().strip()
    if t in ('led', 'sodio'):
        return t
    return t

def normalize_estado(v):
    e = safe_str(v)
    if e is None:
        return 'desconocido'
    e = e.lower().strip()
    if e in ('enciende', 'no enciende', 'dañado/parpadea'):
        return e
    if e == 'danado':
        return 'dañado/parpadea'
    return e

def main():
    df = pd.read_excel(ARCHIVO_EXCEL)

    luminarias = []
    for _, row in df.iterrows():
        fac = safe_str(row.get('Facultad/Sector'))
        if fac:
            fac = fac.strip()
            if fac.lower().startswith('facultad'):
                fac = fac

        l = {
            'id': safe_int(row.get('_id')),
            'facultad': fac,
            'latitude': safe_float(row.get('_Coordenadas GPS_latitude')),
            'longitude': safe_float(row.get('_Coordenadas GPS_longitude')),
            'altitude': safe_float(row.get('_Coordenadas GPS_altitude')),
            'precision': safe_float(row.get('_Coordenadas GPS_precision')),
            'tipo': normalize_tipo(row.get('Tipo de Luminaria ')),
            'altura_poste': safe_float(row.get('Altura del poste ')),
            'luxes': safe_float(row.get('Medición de luxes ')),
            'estado': normalize_estado(row.get('Estado del foco')),
            'etiqueta': safe_str(row.get('Etiqueta del poste')),
            'edificio': safe_str(row.get('¿Esta en un edificio?')),
            'foto_url': safe_str(row.get('Foto del poste _URL')),
            'uuid': safe_str(row.get('_uuid')),
            'grupo': safe_int(row.get('Número de grupo ')),
            'submitted_by': safe_str(row.get('_submitted_by')),
        }
        # Skip rows without valid coordinates
        if l['latitude'] is None or l['longitude'] is None:
            continue
        luminarias.append(l)

    with open(ARCHIVO_SALIDA, 'w', encoding='utf-8') as f:
        json.dump(luminarias, f, indent=2, ensure_ascii=False)

    print(f"Convertidas {len(luminarias)} luminarias → {ARCHIVO_SALIDA}")

if __name__ == '__main__':
    main()
