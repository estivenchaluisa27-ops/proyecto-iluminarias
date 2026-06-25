# Plan de Implementación — Proyecto Iluminarias UCE

> Documento vivo. Actualizar después de cada cambio significativo, decisión arquitectónica o corrección de bug.

---

## 1. Información General

| Campo | Valor |
|-------|-------|
| Proyecto | Sistema de monitoreo y mapeo de luminarias del campus universitario |
| Repositorio | `proyecto-iluminarias` |
| Fecha análisis | 2026-06-25 |
| **Fase actual** | **Fase 3 — Mejoras Técnicas (completada)** |
| Estado actual | Filtro + predicción + mejoras técnicas. Listo para Fase 4. |

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
| ~~Alta~~ | ~~Filtro por facultad no existe~~ | ~~Mapa siempre muestra todo el campus~~ | ✅ Fase 1: dropdown flotante |
| ~~Alta~~ | ~~No hay predicción LED~~ | ~~No se puede dimensionar modernización~~ | ✅ Fase 2: toggle + KPI + mapa simulado |
| Media | Backend lee JSON, frontend usa Firestore | Inconsistencia de fuente de verdad | Mantener JSON para backend (decisión #1), documentar |
| Media | `MapView.tsx` renderiza todos los markers directamente | Posible pérdida de performance si crece el dataset | Modularizar en subcomponentes, evaluar virtualización |
| ~~Media~~ | ~~Popups usan `dangerouslySetInnerHTML`~~ | ~~Riesgo de XSS~~ | ✅ Fase 3: JSX puro via `LuminariaPopup.tsx` |
| ~~Media~~ | ~~CSS monolítico (`index.css`, 1058 líneas)~~ | ~~Difícil mantenimiento~~ | ✅ Fase 3: separado en 5 módulos CSS |
| Baja | UsersPage y SettingsPage vacías | Usuarios ven "en desarrollo" | Fase 4: implementar o eliminar placeholders |
| Baja | Sin tests configurados | Sin retroalimentación automática | Fase 4: Vitest en frontend; correr backend test |
| ~~Baja~~ | ~~Tipos `Luminaria` duplicados en frontend/backend~~ | ~~Posibles inconsistencias~~ | ✅ Fase 3: `shared/luminaria.ts` tipo único |

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

### Fase 2 — Ventana de Predicción LED ✅

**Objetivo:** Visualizar un escenario hipotético donde todas las luminarias son LED y funcionan, además de reportar luxes promedio proyectados.

| # | Tarea | Archivos afectados | Estado |
|---|-------|--------------------|--------|
| 2.1 | Crear hook `usePrediction.ts` con lógica de predicción | `frontend/src/hooks/usePrediction.ts` (nuevo) | ✅ |
| 2.2 | Crear `PredictionToggle.tsx` | `frontend/src/components/mapa/PredictionToggle.tsx` (nuevo) | ✅ |
| 2.3 | Crear `PredictionStats.tsx` con KPIs comparativos | `frontend/src/components/mapa/PredictionStats.tsx` (nuevo) | ✅ |
| 2.4 | Crear tipos de predicción | `frontend/src/types/luminaria.ts` | ✅ |
| 2.5 | Integrar toggle y panel en `MapView` | `frontend/src/pages/MapView.tsx` | ✅ |
| 2.6 | Renderizar markers predichos (todos LED, todos funcionando) | `frontend/src/pages/MapView.tsx` | ✅ |
| 2.7 | Estilos para toggle y panel de predicción | `frontend/src/index.css` | ✅ |

**Lógica implementada:**

```ts
// Factor de conversión basado en datos reales
const LED_SODIO_FACTOR = 68.9 / 64.0; // ≈ 1.08

function predict(luminaria) {
  return {
    ...luminaria,
    tipo: 'led',
    estado: 'enciende',
    luxes: luminaria.luxes > 0
      ? (luminaria.tipo === 'sodio'
          ? luminaria.luxes * LED_SODIO_FACTOR
          : luminaria.luxes)
      : 68.9, // promedio LED real para faltantes
    tipoOriginal, estadoOriginal, luxesOriginal,
  };
}
```

**KPIs implementados:**
- [x] Luxes promedio actual vs predicho.
- [x] % de mejora proyectada.
- [x] Total de luminarias que cambiarían de sodio a LED.
- [x] Número de luminarias que pasan de "no funciona" a "funcionando".
- [x] Tabla comparativa por facultad.

**Criterios de aceptación cumplidos:**
- [x] Toggle claro Actual / Predicción LED.
- [x] En modo predicción el mapa muestra todos los puntos en verde con icono LED.
- [x] El usuario puede ver el lux promedio proyectado.
- [x] El heatmap se actualiza con los luxes predichos.
- [x] Badge "SIMULACIÓN LED" visible en modo predicción.
- [x] Panel de	stats se oculta si se abre el panel de detalles (evita overlap).
- [x] Popups de predicción muestran tipo/estado original vs predicho.

### Fase 3 — Mejoras Técnicas ✅

| # | Tarea | Archivos afectados | Estado |
|---|-------|--------------------|--------|
| 3.1 | Modularizar CSS por feature | `frontend/src/styles/{base,auth,dashboard,map,prediction}.css` + `index.css` como hub | ✅ |
| 3.2 | Reemplazar `dangerouslySetInnerHTML` por JSX puro | `frontend/src/components/mapa/LuminariaPopup.tsx` (nuevo) + `MapView.tsx` | ✅ |
| 3.3 | Agregar Error Boundary global | `frontend/src/components/ErrorBoundary.tsx` (nuevo) + `App.tsx` | ✅ |
| 3.4 | Unificar tipos Luminaria frontend/backend | `shared/luminaria.ts` (nuevo) + `shared/constants.ts` (nuevo) | ✅ |
| 3.5 | Debounce al buscador del mapa | `SearchControl.tsx` ya usa `delay: 300` via leaflet-search | ✅ (preexistente) |
| 3.6 | Evaluar paginación virtualizada | Decisión posterior (dataset 373 → no necesario aún) | — |

**Cambios clave:**
- CSS dividido de 1 archivo monolítico (1058 líneas) → 5 módulos + hub de imports.
- Popups de mapa eliminan `dangerouslySetInnerHTML`, usan componentes JSX (`ActualPopup`, `PredictionPopup`) con clases CSS.
- Popup dark-theme globalizado via `.leaflet-popup-content-wrapper` en `map.css` (antes inline `<style>` por cada popup).
- `ErrorBoundary` class component envuelve toda la app. Muestra mensaje con botón "Recargar página".
- Tipo `Luminaria` centralizado en `shared/luminaria.ts`, re-exportado por frontend y backend.
- Constantes (`FACULTADES`, `LED_AVG_LUX`, etc.) separadas en `shared/constants.ts` (compatibles con ESM del frontend y excluidas del backend).

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
| BUG-1 | ~~`dangerouslySetInnerHTML` en popups del mapa~~ | ~~Media~~ | ~~Fase 3~~ | ✅ Corregido — JSX puro |
| BUG-2 | Backend responde con datos de JSON local mientras el frontend consume Firestore directamente | Media | Documentado (decisión #1) | Abierto |
| BUG-3 | `DashboardHome` no maneja errores de `getAll` para incidencias | Baja | Fase 1/3 | Abierto |
| BUG-4 | `SettingsPage` y `UsersPage` son placeholders sin funcionalidad | Baja | Fase 4 | Abierto |
| BUG-5 | Sin tests automatizados (`npm test` falla en backend) | Media | Fase 4 | Abierto |

---

## 6. Registro de Cambios (Change Log)

### 2026-06-25
- **Fase 3 completada:** Mejoras técnicas implementadas.
  - CSS modularizado: `index.css` (hub) → `base.css`, `auth.css`, `dashboard.css`, `map.css`, `prediction.css`.
  - Eliminado `dangerouslySetInnerHTML` en popups del mapa. Nuevo componente `LuminariaPopup.tsx` con `ActualPopup` y `PredictionPopup` en JSX puro.
  - Popup dark-theme globalizado via CSS (eliminados `<style>` inline duplicados en cada popup).
  - Error Boundary global añadido (`ErrorBoundary.tsx`) envolviendo toda la app en `App.tsx`.
  - Tipos `Luminaria` unificados en `shared/luminaria.ts`. Frontend y backend importan de la misma fuente.
  - Constantes (`FACULTADES`, `LED_AVG_LUX`, etc.) separadas en `shared/constants.ts`.
  - Backend `tsconfig.json` actualizado: `rootDir: "../"` + `include: ["src", "../shared/luminaria.ts"]`.
  - Frontend `tsconfig.app.json` actualizado: `include: ["src", "../shared"]`.
  - BUG-1 cerrado: popups seguros sin `dangerouslySetInnerHTML`.
- **Fase 2 completada:** Predicción LED implementada.
  - Nuevo hook `usePrediction.ts` con lógica de conversión sodio→LED.
  - Componentes `PredictionToggle.tsx` y `PredictionStats.tsx`.
  - Mapa alterna entre estado actual y predicción LED con un toggle.
  - KPIs: luxes promedio actual vs predicho, mejora %, sodio→LED, reparadas.
  - Tabla comparativa por facultad en panel de predicción.
  - Badge "SIMULACIÓN LED" cuando el modo está activo.
  - Markers de predicción (verde uniforme, icono rayo LED).
  - Popups de predicción muestran valores originales vs predichos.
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
