/**
 * Script para importar luminarias.json a Firestore
 * Uso: node scripts/import-to-firestore.mjs
 *
 * Requiere tener configurado el archivo backend/.env con:
 * GOOGLE_APPLICATION_CREDENTIALS=ruta/a/serviceAccountKey.json
 * o FIREBASE_PROJECT_ID=iluminariasuce
 */
import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)),
  projectId: process.env.FIREBASE_PROJECT_ID || 'iluminariasuce',
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
