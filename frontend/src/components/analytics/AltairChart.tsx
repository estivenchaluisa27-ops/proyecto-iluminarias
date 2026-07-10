import { useEffect, useRef } from 'react';

interface Props {
  spec: Record<string, unknown> | null;
  loading?: boolean;
}

export default function AltairChart({ spec, loading }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!spec || !ref.current) return;
    import('vega-embed').then((vega) => {
      vega.default(ref.current as HTMLElement, spec, { actions: false });
    });
  }, [spec]);

  if (loading) {
    return <div className="chart-loading">Cargando gráfico...</div>;
  }
  if (!spec) {
    return <div className="chart-empty">Gráfico no disponible</div>;
  }
  return <div ref={ref} />;
}
