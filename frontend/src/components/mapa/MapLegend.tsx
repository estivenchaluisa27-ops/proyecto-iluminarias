import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const LegendControl = L.Control.extend({
  options: { position: 'bottomright' },

  onAdd: () => {
    const div = L.DomUtil.create('div', 'info legend');
    div.style.backgroundColor = 'white';
    div.style.padding = '12px';
    div.style.borderRadius = '6px';
    div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
    div.style.fontFamily = "'Segoe UI', Arial, sans-serif";
    div.style.fontSize = '12px';
    div.style.lineHeight = '1.8';
    div.style.color = '#1e293b';
    div.innerHTML = [
      '<div style="font-weight:700;margin-bottom:8px;font-size:13px;">Leyenda</div>',
      '<div style="font-size:11px;color:#475569;font-weight:600;margin-bottom:4px;">ESTADO DEL FOCO</div>',
      '<div><i style="background:#22c55e;width:12px;height:12px;border-radius:50%;display:inline-block;margin-right:8px;"></i>Funciona correctamente</div>',
      '<div><i style="background:#ef4444;width:12px;height:12px;border-radius:50%;display:inline-block;margin-right:8px;"></i>No enciende</div>',
      '<div><i style="background:#f97316;width:12px;height:12px;border-radius:50%;display:inline-block;margin-right:8px;"></i>Dañado o parpadea</div>',
      '<div><i style="background:#6b7280;width:12px;height:12px;border-radius:50%;display:inline-block;margin-right:8px;"></i>Estado desconocido</div>',
      '<div style="margin-top:10px;font-size:11px;color:#475569;font-weight:600;margin-bottom:4px;">TIPO DE LUMINARIA</div>',
      '<div><i class="fa fa-bolt" style="width:12px;margin-right:8px;color:#eab308;"></i>LED</div>',
      '<div><i class="fa fa-lightbulb" style="width:12px;margin-right:8px;color:#f97316;"></i>Sodio</div>',
      '<div style="margin-top:10px;font-size:11px;color:#475569;font-weight:600;margin-bottom:4px;">MAPA DE CALOR</div>',
      '<div style="height:12px;border-radius:2px;background:linear-gradient(to right, #313695, #74add1, #fdae61, #d73027);margin:4px 0;"></div>',
      '<div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;"><span>Bajo</span><span>Alto (luxes)</span></div>',
    ].join('');
    return div;
  },
});

export default function MapLegend() {
  const map = useMap();

  useEffect(() => {
    const legend = new LegendControl();
    legend.addTo(map);

    return () => {
      map.removeControl(legend);
    };
  }, [map]);

  return null;
}
