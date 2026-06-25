import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import type { Luminaria } from '../../../shared/luminaria.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../../data/luminarias.json');

function loadData(): Luminaria[] {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw) as Luminaria[];
}

export function getAll(_req: AuthRequest, res: Response) {
  const data = loadData();
  res.json(data);
}

export function getById(req: AuthRequest, res: Response) {
  const data = loadData();
  const id = Number(req.params.id);
  const item = data.find((l) => l.id === id);
  if (!item) {
    res.status(404).json({ error: 'Luminaria no encontrada' });
    return;
  }
  res.json(item);
}

export function getStats(_req: AuthRequest, res: Response) {
  const data = loadData();
  const total = data.length;
  const porTipo: Record<string, number> = {};
  const porEstado: Record<string, number> = {};
  const porFacultad: Record<string, number> = {};
  let conMedicion = 0;
  let sinMedicion = 0;
  let luxesTotal = 0;

  for (const l of data) {
    porTipo[l.tipo] = (porTipo[l.tipo] ?? 0) + 1;
    porEstado[l.estado] = (porEstado[l.estado] ?? 0) + 1;
    porFacultad[l.facultad] = (porFacultad[l.facultad] ?? 0) + 1;

    if (l.luxes !== null && l.luxes > 0) {
      conMedicion++;
      luxesTotal += l.luxes;
    } else {
      sinMedicion++;
    }
  }

  res.json({
    total,
    porTipo,
    porEstado,
    porFacultad,
    conMedicion,
    sinMedicion,
    luxesPromedio: conMedicion > 0 ? +(luxesTotal / conMedicion).toFixed(1) : 0,
  });
}

export function create(req: AuthRequest, res: Response) {
  const data = loadData();
  const nuevo = {
    id: Date.now(),
    ...req.body,
  } as Luminaria;

  data.push(nuevo);
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  res.status(201).json(nuevo);
}

export function update(req: AuthRequest, res: Response) {
  const data = loadData();
  const id = Number(req.params.id);
  const idx = data.findIndex((l) => l.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Luminaria no encontrada' });
    return;
  }

  data[idx] = { ...data[idx], ...req.body, id };
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  res.json(data[idx]);
}

export function remove(req: AuthRequest, res: Response) {
  const data = loadData();
  const id = Number(req.params.id);
  const idx = data.findIndex((l) => l.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Luminaria no encontrada' });
    return;
  }

  data.splice(idx, 1);
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  res.json({ message: 'Luminaria eliminada' });
}
