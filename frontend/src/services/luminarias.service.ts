import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Luminaria, LuminariaStats } from '../types/luminaria';

const COL = 'luminarias';

export const luminariasService = {
  async getAll(): Promise<Luminaria[]> {
    const snap = await getDocs(collection(db, COL));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as unknown as Luminaria));
  },

  async getById(id: string): Promise<Luminaria> {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) throw new Error('Luminaria no encontrada');
    return { ...snap.data(), id: snap.id } as unknown as Luminaria;
  },

  async getStats(): Promise<LuminariaStats> {
    const data = await luminariasService.getAll();
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

    return {
      total,
      porTipo,
      porEstado,
      porFacultad,
      conMedicion,
      sinMedicion,
      luxesPromedio: conMedicion > 0 ? +(luxesTotal / conMedicion).toFixed(1) : 0,
    };
  },

  async create(data: Partial<Luminaria>): Promise<Luminaria> {
    const ref = await addDoc(collection(db, COL), data);
    return { ...data, id: ref.id } as unknown as Luminaria;
  },

  async update(id: string, data: Partial<Luminaria>): Promise<Luminaria> {
    const ref = doc(db, COL, String(id));
    await updateDoc(ref, data as Record<string, unknown>);
    return { ...data, id } as unknown as Luminaria;
  },

  async remove(id: string): Promise<{ message: string }> {
    await deleteDoc(doc(db, COL, String(id)));
    return { message: 'Luminaria eliminada' };
  },
};
