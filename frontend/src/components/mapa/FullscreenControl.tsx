import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-fullscreen';

export default function FullscreenControl() {
  const map = useMap();

  useEffect(() => {
    const control = L.control.fullscreen({
      position: 'topleft',
      title: {
        false: 'Pantalla Completa',
        true: 'Salir de Pantalla Completa',
      },
    });
    control.addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [map]);

  return null;
}
