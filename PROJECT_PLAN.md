# Plan de Implementación — Proyecto Iluminarias UCE

> Documento vivo. Actualizar después de cada cambio significativo, decisión arquitectónica o corrección de bug.

---

## 1. Información General

| Campo | Valor |
|-------|-------|
| Proyecto | Sistema de monitoreo y mapeo de luminarias del campus universitario |
| Repositorio | `proyecto-iluminarias` |
| Fecha análisis | 2026-06-25 |
| **Fase actual** | **Fase 1 — Filtro por Facultad (completada)** |
| Estado actual | Filtro por facultad funcional en el mapa y dashboard. Listo para Fase 2. |

### Stack detectado

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + Vite 8 + TypeScript + Leaflet + react-leaflet + Firebase Auth/Firestore |
| Backend | Express 5 + TypeScript + Firebase Admin SDK |
| Datos | KoboToolbox → Excel → JSON → API, actualmente duplicados en Firestore (frontend) y JSON local (backend) |
| Hosting | Firebase Hosting |

### Dataset actual (luminarias.json)

- **Total:** 373 luminarias
- **Facultades:** 16
- **Tipos:** 307 sodio / 66 LED
- **Estados:** 246 enciende / 116 no enciende / 10 dañado/parpadea / 1 desconocido
- **Luxes promedio reales:**
  - LED: **68.9 lx** (n=42)
  - Sodio: **64.0 lx** (n=217)
- **Factor LED vs Sodio observado:** 68.9 / 64.0 ≈ **1.08**

---

## 2. Decisiones Tomadas

| # | Decisión | Justificación |
|---|----------|---------------|
| 1 | **Backend permanece con JSON local** (`backend/data/luminarias.json`) | El dataset es pequeño (373 registros), el esfuerzo de migrar a Firestore no aporta valor funcional inmediato. |
| 2 | **La predicción LED será un *tab/toggle* dentro del Mapa actual** | Mantiene al usuario en contexto geográfico; no requiere crear una ruta nueva de navegación. |
| 3 | **Incluir toggle "Actual ↔ Predicción LED"** | Permite comparar el escenario actual y el futuro de forma rápida sin cambiar de vista. |
| 4 | **La simulación se calcula en el frontend** | 373 registros son manejables en cliente; evita modificar el backend. El backend solo provee lectura. |
| 5 | **Luxes predichos = promedio LED real (68.9 lx) para faltantes; factor 1.08 para sodios con medición** | Basado 100 % en datos reales existentes del proyecto. |

---

## 3. Puntos de Mejora Detectados (deuda técnica)

| Prioridad | Tema | Impacto | Solución prevista |
|-----------|------|---------|-------------------|
| Alta | Filtro por facultad no existe | Mapa siempre muestra todo el campus; difícil análisis por unidad académica | Fase 1: dropdown flotante sobre el mapa |
| Alta | No hay predicción LED | No se puede dimensionar el impacto de modernización | Fase 2: tabla + KPI + mapa simulado |
| Media | Backend lee JSON, frontend usa Firestore | Inconsistencia de fuente de verdad | Mantener JSON para backend (decisión #1), documentar |
| Media | `MapView.tsx` renderiza todos los markers directamente | Posible pérdida de performance si crece el dataset | Modularizar en subcomponentes, evaluar virtualización |
| Media | Popups usan `dangerouslySetInnerHTML` | Riesgo de XSS si datos externos no son confiables | Fase 3: reemplazar popups por JSX puro |
| Media | CSS monolítico (`index.css`, 752 líneas) | Difícil mantenimiento | Fase 3: separar por feature (`mapa.css`, `auth.css`, `dashboard.css`) |
| Baja | UsersPage y SettingsPage vacías | Usuarios ven "en desarrollo" | Fase 4: implementar o eliminar placeholders |
| Baja | Sin tests configurados | Sin retroalimentación automática | Fase 4: Vitest en frontend; correr backend test |
| Baja | Tipos `Luminaria` duplicados en frontend/backend | Posibles inconsistencias de tipos | Fase 3: centralizar interfaz o usar schema compartido |

---

## 4. Plan por Fases

### Fase 0 — Análisis y planificación ✅

- [x] Revisión de la estructura del repositorio.
- [x] Lectura de componentes, páginas, servicios y backend.
- [x] Análisis del dataset (`luminarias.json`).
- [x] Definición de decisiones clave con el usuario.
- [x] Creación de este documento.

### Fase 1 — Filtro por Facultad ✅

**Objetivo:** Permitir filtrar luminarias por facultad en el mapa y en el dashboard.

| # | Tarea | Archivos afectados | Estado |
|---|-------|--------------------|--------|
| 1.1 | Crear componente `FacultyFilter.tsx` | `frontend/src/components/mapa/FacultyFilter.tsx` (nuevo) | ✅ |
| 1.2 | Agregar constante de facultades | `frontend/src/types/luminaria.ts` | ✅ |
| 1.3 | Integrar filtro en `MapView` (markers, heatmap, búsqueda) | `frontend/src/pages/MapView.tsx` | ✅ |
| 1.4 | Pasar `filteredLuminarias` a `SearchControl` | `frontend/src/pages/MapView.tsx` | ✅ |
| 1.5 | Agregar filtro en DashboardHome + incidencias dinámicas | `frontend/src/pages/Dashboard.tsx` | ✅ |
| 1.6 | Estilos para dropdown flotante oscuro | `frontend/src/index.css` | ✅ |

**Criterios de aceptación cumplidos:**
- [x] Dropdown flotante sobre el mapa con las 16 facultades + "Todas las facultades".
- [x] El mapa, heatmap y búsqueda responden al filtro.
- [x] Contador "X/Y" visible.
- [x] Dashboard con filtro por facultad en la tabla de incidencias.

### Fase 2 — Ventana de Predicción LED

**Objetivo:** Visualizar un escenario hipotético donde todas las luminarias son LED y funcionan, además de reportar luxes promedio proyectados.

| # | Tarea | Archivos afectados |
|---|-------|--------------------|
| 2.1 | Crear hook `usePrediction.ts` con lógica de predicción | `frontend/src/hooks/usePrediction.ts` (nuevo) |
| 2.2 | Crear `PredictionToggle.tsx` | `frontend/src/components/mapa/PredictionToggle.tsx` (nuevo) |
| 2.3 | Crear `PredictionStats.tsx` con KPIs comparativos | `frontend/src/components/mapa/PredictionStats.tsx` (nuevo) |
| 2.4 | Crear tipos de predicción | `frontend/src/types/luminaria.ts` |
| 2.5 | Integrar toggle y panel en `MapView` | `frontend/src/pages/MapView.tsx` |
| 2.6 | Renderizar markers predichos (todos LED, todos funcionando) | `frontend/src/pages/MapView.tsx` |
| 2.7 | Estilos para toggle y panel de predicción | `frontend/src/index.css` |

**Lógica de predicción (a implementar):**

```ts
// Pseudocódigo resumen
function predict(luminaria) {
  const conversionFactor = 68.9 / 64.0; // 1.08
  return {
    ...luminaria,
    tipo: 'led',
    estado: 'enciende',
    luxes: luminaria.luxes > 0
      ? (luminaria.tipo === 'sodio'
          ? luminaria.luxes * conversionFactor
          : luminaria.luxes)
      : 68.9, // promedio LED real para faltantes
  };
}
```

**KPIs mínimos a mostrar:**
- Luxes promedio actual vs predicho.
- % de mejora proyectada.
- Total de luminarias que cambiarían de sodio a LED.
- Número de luminarias que pasan de "no funciona" a "funcionando".

**Criterios de aceptación:**
- Existe un toggle claro Actual / Predicción LED.
- En modo predicción el mapa muestra todos los puntos en verde (funcionando) con icono LED.
- El usuario puede ver el lux promedio proyectado.
- El heatmap se actualiza con los luxes predichos.

### Fase 3 — Mejoras Técnicas

| # | Tarea | Archivos afectados |
|---|-------|--------------------|
| 3.1 | Modularizar CSS por feature | `frontend/src/styles/*.css` o similares |
| 3.2 | Reemplazar `dangerouslySetInnerHTML` del popup por JSX puro | `frontend/src/pages/MapView.tsx` |
| 3.3 | Agregar Error Boundary global | `frontend/src/App.tsx` |
| 3.4 | Unificar/consolidar tipos Luminaria | `frontend/src/types/luminaria.ts` + `backend/src/controllers/luminarias.controller.ts` |
| 3.5 | Agregar debounce al buscador del mapa | `frontend/src/components/mapa/SearchControl.tsx` |
| 3.6 | Evaluar paginación virtualizada si el dataset crece | Decisión posterior |

### Fase 4 — Funcionalidad Pendiente

| # | Tarea | Archivos afectados |
|---|-------|--------------------|
| 4.1 | Implementar UsersPage | `frontend/src/pages/UsersPage.tsx` |
| 4.2 | Implementar SettingsPage | `frontend/src/pages/SettingsPage.tsx` |
| 4.3 | Configurar Vitest + tests unitarios base | `frontend/package.json`, `frontend/vitest.config.*` |
| 4.4 | Corrección de `npm test` en backend | `backend/package.json` |

---

## 5. Registro de Bugs / Problemas Conocidos

| ID | Descripción | Severidad | Fase de corrección | Estado |
|----|-------------|-----------|--------------------|--------|
| BUG-1 | `dangerouslySetInnerHTML` en popups del mapa | Media | Fase 3 | Abierto |
| BUG-2 | Backend responde con datos de JSON local mientras el frontend consume Firestore directamente | Media | Documentado (decisión #1) | Abierto |
| BUG-3 | `DashboardHome` no maneja errores de `getAll` para incidencias | Baja | Fase 1/3 | Abierto |
| BUG-4 | `SettingsPage` y `UsersPage` son placeholders sin funcionalidad | Baja | Fase 4 | Abierto |
| BUG-5 | Sin tests automatizados (`npm test` falla en backend) | Media | Fase 4 | Abierto |

---

## 6. Registro de Cambios (Change Log)

### 2026-06-25
- **Fase 1 completada:** Filtro por facultad implementado.
  - Nuevo componente `FacultyFilter.tsx` con dropdown flotante sobre el mapa.
  - Mapa, heatmap y búsqueda responden al filtro seleccionado.
  - DashboardHome con selector de facultad que filtra la tabla de incidencias.
  - Estilos oscuros consistentes con el diseño existente.
- Se completó el análisis del proyecto.
- Se definieron las decisiones arquitectónicas clave (ver sección 2).
- Se creó este plan de implementación (`PROJECT_PLAN.md`).

---

## 7. Cómo Actualizar Este Documento

Cada vez que se complete una fase, una tarea o se detecte un nuevo bug/cambio importante:

1. Mover el check `[ ]` a `[x]` en la fase correspondiente.
2. Actualizar la **Fase actual** en la sección 1.
3. Agregar un bug a la sección 5 o marcarlo como corregido.
4. Agregar una entrada en el Change Log (sección 6) con la fecha y descripción.
5. Si una decisión cambia, agregarla a la sección 2 con su justificación.
