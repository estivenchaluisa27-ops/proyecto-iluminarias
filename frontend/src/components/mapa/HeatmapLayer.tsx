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
  }, [map, latlngs, radius, blur, maxZoom, gradient]);

  return null;
}
