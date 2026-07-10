/**
 * Script para importar luminarias.json a Firestore
 * Uso: node scripts/import-to-firestore.mjs
 *
 * Requiere el archivo backend/.env con:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 */
import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();
const COL = 'luminarias';

const dataPath = path.resolve(__dirname, '../backend/data/luminarias.json');
const luminarias = JSON.parse(readFileSync(dataPath, 'utf-8'));

console.log(`Importando ${luminarias.length} luminarias a Firestore...`);

// Eliminar todos los documentos existentes en Firestore que ya no estan en el JSON
const existingSnap = await db.collection(COL).get();
const idsEnJson = new Set(luminarias.map((l) => String(l.id)));
const docsEliminar = existingSnap.docs.filter((d) => !idsEnJson.has(d.id));

if (docsEliminar.length > 0) {
  console.log(`Eliminando ${docsEliminar.length} documentos obsoletos de Firestore...`);
  for (let i = 0; i < docsEliminar.length; i += 500) {
    const batch = db.batch();
    const chunk = docsEliminar.slice(i, i + 500);
    for (const doc of chunk) {
      batch.delete(doc.ref);
    }
    await batch.commit();
  }
}

// Escribir los datos actualizados
for (let i = 0; i < luminarias.length; i += 500) {
  const batch = db.batch();
  const chunk = luminarias.slice(i, i + 500);
  for (const lum of chunk) {
    const ref = db.collection(COL).doc(String(lum.id));
    batch.set(ref, lum);
  }
  await batch.commit();
}

console.log('✅ Importacion completada exitosamente');
