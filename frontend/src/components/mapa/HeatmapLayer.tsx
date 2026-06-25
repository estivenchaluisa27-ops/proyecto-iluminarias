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

// Monkey-patch para evitar crash cuando el canvas mide 0x0
// Extender el tipo HeatLayer para incluir _canvas
declare module 'leaflet' {
  interface HeatLayer {
    _canvas: HTMLCanvasElement | null;
    __original_redraw: () => void;
  }
}

// Guardar el original
// @ts-ignore
const originalRedraw = L.HeatLayer.prototype._redraw;

// Aplicar el patch
// @ts-ignore
L.HeatLayer.prototype._redraw = function _redraw() {
  if (!this._canvas || this._canvas.width === 0 || this._canvas.height === 0) {
    return;
  }
  // @ts-ignore
  return originalRedraw.call(this);
};

// Restaurar el original cuando el componente se desmonte
// Esto evita que el patch persista en otros mapas
const cleanupPatch = () => {
  // @ts-ignore
  L.HeatLayer.prototype._redraw = originalRedraw;
};

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
        cleanupPatch();
      };
    };

    map.whenReady(readyHandler);
    return () => {
      cleanupPatch();
    };
  }, [map, latlngs, radius, blur, maxZoom, gradient]);

  return null;
}
