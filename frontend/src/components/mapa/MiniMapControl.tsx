import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-minimap';

export default function MiniMapControl() {
  const map = useMap();

  useEffect(() => {
    const tileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
      }
    );

    const control = new L.Control.MiniMap(tileLayer, {
      position: 'bottomleft',
      toggleDisplay: true,
      width: 150,
      height: 150,
      zoomLevelOffset: -5,
    });
    control.addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [map]);

  return null;
}
