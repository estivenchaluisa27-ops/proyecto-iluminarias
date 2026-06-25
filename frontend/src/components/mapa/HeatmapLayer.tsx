import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface Props {
  latlngs: Array<[number, number, number]>;
  radius?: number;
  blur?: number;
  maxZoom?: number;
  gradient?: Record<number, string>;
}

const HEATMAP_GRADIENT: Record<number, string> = {
  0.0: '#313695',
  0.2: '#4575b4',
  0.4: '#74add1',
  0.6: '#fdae61',
  0.8: '#f46d43',
  1.0: '#d73027',
};

// =========================================================================
// PATCH GLOBAL PARA leaflet.heat — evitar crash cuando el canvas mide 0x0
// =========================================================================
// @ts-ignore — evitar errores de TypeScript por propiedades no tipadas
if (!L.HeatLayer.prototype.hasOwnProperty('__patched')) {
  // Guardar el original
  // @ts-ignore
  const originalRedraw = L.HeatLayer.prototype._redraw;

  // Aplicar el patch
  // @ts-ignore
  L.HeatLayer.prototype._redraw = function _redraw() {
    // Type assertion para acceder a _canvas y _map
    const self = this as any;
    // Si el mapa no está listo o el canvas no tiene dimensiones, retornar temprano
    if (!self._map || !self._canvas || self._canvas.width === 0 || self._canvas.height === 0) {
      return;
    }
    // @ts-ignore
    return originalRedraw.call(self);
  };

  // Marcar como parcheado para evitar re-aplicación
  // @ts-ignore
  L.HeatLayer.prototype.__patched = true;
}

// =========================================================================
// COMPONENTE HEATMAPLAYER
// =========================================================================
export default function HeatmapLayer({
  latlngs,
  radius = 30,
  blur = 20,
  maxZoom = 20,
  gradient = HEATMAP_GRADIENT,
}: Props) {
  const map = useMap();

  useEffect(() => {
    if (latlngs.length === 0) return;

    // Forzar recálculo de tamaño del mapa para evitar canvas 0x0
    map.invalidateSize();

    // Esperar a que el mapa esté listo (layout completo)
    const readyHandler = () => {
      const heat = L.heatLayer(latlngs, {
        radius,
        blur,
        maxZoom,
        gradient,
        minOpacity: 0.4,
      });
      heat.addTo(map);

      return () => {
        map.removeLayer(heat);
      };
    };

    map.whenReady(readyHandler);
  }, [map, latlngs, radius, blur, maxZoom, gradient]);

  return null;
}
