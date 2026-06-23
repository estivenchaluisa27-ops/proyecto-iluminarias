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

const dataPath = path.resolve(__dirname, '../backend/data/luminarias.json');
const luminarias = JSON.parse(readFileSync(dataPath, 'utf-8'));

console.log(`Importando ${luminarias.length} luminarias a Firestore...`);

const batch = db.batch();
for (const lum of luminarias) {
  const ref = db.collection('luminarias').doc(String(lum.id));
  batch.set(ref, lum);
}

await batch.commit();
console.log('✅ Importación completada exitosamente');
