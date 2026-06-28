import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePrediction } from '../hooks/usePrediction';
import type { Luminaria } from '../../types/luminaria';

const fixtures: Luminaria[] = [
  {
    id: 1,
    facultad: 'Ingeniería',
    latitude: -2.15,
    longitude: -79.96,
    altitude: null,
    precision: null,
    tipo: 'sodio',
    altura_poste: null,
    luxes: 60,
    estado: 'enciende',
    etiqueta: null,
    edificio: 'Edif A',
    foto_url: '',
    uuid: 'a',
    grupo: null,
    submitted_by: 'test',
  },
  {
    id: 2,
    facultad: 'Ingeniería',
    latitude: -2.16,
    longitude: -79.97,
    altitude: null,
    precision: null,
    tipo: 'led',
    altura_poste: null,
    luxes: 70,
    estado: 'no enciende',
    etiqueta: null,
    edificio: 'Edif B',
    foto_url: '',
    uuid: 'b',
    grupo: null,
    submitted_by: 'test',
  },
  {
    id: 3,
    facultad: 'Ciencias',
    latitude: -2.17,
    longitude: -79.98,
    altitude: null,
    precision: null,
    tipo: 'sodio',
    altura_poste: null,
    luxes: null,
    estado: 'no enciende',
    etiqueta: null,
    edificio: 'Edif C',
    foto_url: '',
    uuid: 'c',
    grupo: null,
    submitted_by: 'test',
  },
];

describe('usePrediction', () => {
  it('convirtiendo sodio→LED aplica factor 1.08 a luxes existentes', () => {
    const { result } = renderHook(() => usePrediction(fixtures));
    const sodio = result.current.predicted[0];
    expect(sodio.tipo).toBe('led');
    expect(sodio.estado).toBe('enciende');
    expect(sodio.luxes).toBeCloseTo(60 * (68.9 / 64.0), 1);
    expect(sodio.tipoOriginal).toBe('sodio');
    expect(sodio.estadoOriginal).toBe('enciende');
  });

  it('LED existente mantiene sus luxes pero cambia estado a enciende', () => {
    const { result } = renderHook(() => usePrediction(fixtures));
    const led = result.current.predicted[1];
    expect(led.tipo).toBe('led');
    expect(led.estado).toBe('enciende');
    expect(led.luxes).toBe(70);
    expect(led.estadoOriginal).toBe('no enciende');
  });

  it('sin medición usa promedio LED real (68.9 lx)', () => {
    const { result } = renderHook(() => usePrediction(fixtures));
    const noLux = result.current.predicted[2];
    expect(noLux.luxes).toBe(68.9);
  });

  it('stats calcula sodioToLed y reparadas correctamente', () => {
    const { result } = renderHook(() => usePrediction(fixtures));
    const { stats } = result.current;
    expect(stats.totalLuminarias).toBe(3);
    expect(stats.sodioToLed).toBe(2);
    expect(stats.reparadas).toBe(2);
  });

  it('stats calcula mejora porcentual > 0', () => {
    const { result } = renderHook(() => usePrediction(fixtures));
    expect(result.current.stats.mejoraPorcentual).toBeGreaterThan(0);
  });
});
