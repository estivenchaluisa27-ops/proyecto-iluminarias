import { useMemo } from 'react';
import type { Luminaria } from '../types/luminaria';
import type { PredictionLuminaria, PredictionStatsData } from '../types/luminaria';
import { LED_AVG_LUX, LED_SODIO_FACTOR } from '../types/luminaria';

export function usePrediction(luminarias: Luminaria[]) {
  const predicted = useMemo<PredictionLuminaria[]>(() => {
    return luminarias.map((l) => {
      const tipoOriginal = l.tipo;
      const estadoOriginal = l.estado;
      const luxesOriginal = l.luxes;

      let predictedLuxes: number;

      if (luxesOriginal !== null && luxesOriginal > 0) {
        if (tipoOriginal?.toLowerCase() === 'sodio') {
          predictedLuxes = +(luxesOriginal * LED_SODIO_FACTOR).toFixed(1);
        } else {
          predictedLuxes = luxesOriginal;
        }
      } else {
        predictedLuxes = +LED_AVG_LUX.toFixed(1);
      }

      return {
        ...l,
        tipo: 'led',
        estado: 'enciende',
        luxes: predictedLuxes,
        tipoOriginal,
        estadoOriginal,
        luxesOriginal,
      };
    });
  }, [luminarias]);

  const stats = useMemo<PredictionStatsData>(() => {
    const totalLuminarias = luminarias.length;
    let sodioToLed = 0;
    let reparadas = 0;
    let luxesTotalActual = 0;
    let luxesCountActual = 0;
    let luxesTotalPredicho = 0;
    let luxesCountPredicho = 0;

    const byFacultad: Record<string, {
      total: number;
      sodioToLed: number;
      reparadas: number;
      luxesActual: number;
      luxesPredicho: number;
      mejora: number;
      _countActual: number;
      _countPredicho: number;
    }> = {};

    for (const l of luminarias) {
      const f = l.facultad?.trim() || 'Sin facultad';
      if (!byFacultad[f]) {
        byFacultad[f] = { total: 0, sodioToLed: 0, reparadas: 0, luxesActual: 0, luxesPredicho: 0, mejora: 0, _countActual: 0, _countPredicho: 0 };
      }
      byFacultad[f].total++;

      if (l.tipo?.toLowerCase() === 'sodio') sodioToLed++;
      if (l.estado?.toLowerCase() !== 'enciende') reparadas++;

      if (l.luxes !== null && l.luxes > 0) {
        luxesTotalActual += l.luxes;
        luxesCountActual++;
        byFacultad[f]._countActual++;
        byFacultad[f].luxesActual += l.luxes;
      }

      const predLux = l.tipo?.toLowerCase() === 'sodio' && l.luxes !== null && l.luxes > 0
        ? +(l.luxes * LED_SODIO_FACTOR).toFixed(1)
        : l.luxes !== null && l.luxes > 0
          ? l.luxes
          : LED_AVG_LUX;

      luxesTotalPredicho += predLux;
      luxesCountPredicho++;
      byFacultad[f]._countPredicho++;
      byFacultad[f].luxesPredicho += predLux;
    }

    const luxesPromedioActual = luxesCountActual > 0 ? +(luxesTotalActual / luxesCountActual).toFixed(1) : 0;
    const luxesPromedioPredicho = luxesCountPredicho > 0 ? +(luxesTotalPredicho / luxesCountPredicho).toFixed(1) : 0;
    const mejoraPorcentual = luxesPromedioActual > 0 ? +(((luxesPromedioPredicho - luxesPromedioActual) / luxesPromedioActual) * 100).toFixed(1) : 0;
    const ahorroEnergeticoEstimado = +(sodioToLed * 0.55).toFixed(0);

    const porFacultad: PredictionStatsData['porFacultad'] = {};
    for (const [f, d] of Object.entries(byFacultad)) {
      const avgActual = d._countActual > 0 ? +(d.luxesActual / d._countActual).toFixed(1) : 0;
      const avgPredicho = d._countPredicho > 0 ? +(d.luxesPredicho / d._countPredicho).toFixed(1) : 0;
      porFacultad[f] = {
        total: d.total,
        sodioToLed: d.sodioToLed,
        reparadas: d.reparadas,
        luxesActual: avgActual,
        luxesPredicho: avgPredicho,
        mejora: avgActual > 0 ? +(((avgPredicho - avgActual) / avgActual) * 100).toFixed(1) : 0,
      };
    }

    return {
      totalLuminarias,
      sodioToLed,
      reparadas,
      luxesPromedioActual,
      luxesPromedioPredicho,
      mejoraPorcentual,
      ahorroEnergeticoEstimado,
      porFacultad,
    };
  }, [luminarias]);

  return { predicted, stats };
}
