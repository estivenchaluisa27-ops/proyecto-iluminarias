import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-search';
import type { Luminaria } from '../../types/luminaria';

interface Props {
  luminarias: Luminaria[];
}

export default function SearchControl({ luminarias }: Props) {
  const map = useMap();

  useEffect(() => {
    const searchControl = L.control.search({
      position: 'topright',
      sourceData: (_text: string, _callback: (r: unknown[]) => void) => {
        const text = _text?.toLowerCase() || '';
        if (text.length < 2) {
          _callback([]);
          return;
        }
        const results = luminarias
          .filter(
            (l) =>
              String(l.id).includes(text) ||
              l.facultad?.toLowerCase().includes(text) ||
              l.tipo?.toLowerCase().includes(text) ||
              l.estado?.toLowerCase().includes(text) ||
              (l.etiqueta || '').toLowerCase().includes(text)
          )
          .slice(0, 30)
          .map((l) => ({
            loc: [l.latitude, l.longitude] as [number, number],
            title: `#${l.id} | ${l.tipo?.toUpperCase()} | ${l.facultad}`,
          }));
        _callback(results);
      },
      propertyLoc: 'loc',
      propertyName: 'title',
      autoCollapse: true,
      autoType: false,
      minLength: 2,
      delay: 300,
      markerLocation: false,
      textPlaceholder: 'Buscar luminaria...',
    });
    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, luminarias]);

  return null;
}
