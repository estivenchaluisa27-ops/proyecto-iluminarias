# Proyecto Iluminarias — UCE

Sistema de monitoreo y mapeo de luminarias del campus universitario.

## Estructura

| Carpeta | Descripción |
|---------|-------------|
| `frontend/` | App React + Vite + TypeScript (Login, Dashboard, Mapa Leaflet) |
| `backend/` | API Express + TypeScript (Firebase Admin, datos luminarias) |
| `maps/` | Generación de mapas con Python/Folium desde Excel |
| `scripts/` | Utilidades |

## Requisitos

- Node.js 20+
- Python 3.10+ (para `maps/`)
- Firebase project (Web + Admin SDK)

## Inicio rápido

```bash
# Backend
cd backend
cp .env.example .env   # configurar credenciales Firebase
npm install
npm run dev

# Frontend
cd frontend
cp .env.example .env   # configurar credenciales Firebase Web
npm install
npm run dev
```

## Stack

- **Frontend:** React 19, Vite 8, TypeScript, Leaflet, Firebase Auth
- **Backend:** Express 5, Firebase Admin SDK
- **Datos:** KoboToolbox → Excel → Python (Folium) / JSON → API
