import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockData = [
  { id: 1, facultad: 'Ing', tipo: 'sodio', estado: 'enciende', luxes: 60, latitude: -2.15, longitude: -79.96, altitude: null, precision: null, altura_poste: null, etiqueta: null, edificio: 'A', foto_url: '', uuid: 'a', grupo: null, submitted_by: 'test' },
  { id: 2, facultad: 'Ciencias', tipo: 'led', estado: 'no enciende', luxes: 70, latitude: -2.16, longitude: -79.97, altitude: null, precision: null, altura_poste: null, etiqueta: null, edificio: 'B', foto_url: '', uuid: 'b', grupo: null, submitted_by: 'test' },
  { id: 3, facultad: 'Ing', tipo: 'sodio', estado: 'dañado/parpadea', luxes: null, latitude: -2.17, longitude: -79.98, altitude: null, precision: null, altura_poste: null, etiqueta: null, edificio: 'C', foto_url: '', uuid: 'c', grupo: null, submitted_by: 'test' },
];

vi.mock('node:fs', () => ({
  default: {
    readFileSync: () => JSON.stringify(mockData),
    writeFileSync: vi.fn(),
  },
}));

vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(),
  cert: vi.fn(),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(),
}));

describe('luminarias.controller', () => {
  let ctrl: typeof import('../controllers/luminarias.controller');

  beforeEach(async () => {
    ctrl = await import('../controllers/luminarias.controller');
  });

  function mockRes() {
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as any;
    return res;
  }

  it('getAll retorna todas las luminarias', () => {
    const res = mockRes();
    ctrl.getAll({} as any, res);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  it('getById retorna luminaria existente', () => {
    const res = mockRes();
    ctrl.getById({ params: { id: '1' } } as any, res);
    expect(res.json).toHaveBeenCalledWith(mockData[0]);
  });

  it('getById retorna 404 para luminaria inexistente', () => {
    const res = mockRes();
    ctrl.getById({ params: { id: '999' } } as any, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('getStats calcula correctamente', () => {
    const res = mockRes();
    ctrl.getStats({} as any, res);
    const stats = res.json.mock.calls[0][0];
    expect(stats.total).toBe(3);
    expect(stats.porTipo.sodio).toBe(2);
    expect(stats.porTipo.led).toBe(1);
    expect(stats.porEstado.enciende).toBe(1);
  });
});
