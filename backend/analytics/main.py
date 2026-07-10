import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import stats, distributions, faculty_analysis, comparison, network_analysis, missing_data, correlations

app = FastAPI(title="Analytics - Iluminarias UCE")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/analytics/describe")
def get_describe():
    return stats.describe()

@app.get("/analytics/kpi")
def get_kpi():
    return stats.kpi_resumen()

@app.get("/analytics/distribucion/luxes")
def get_hist_kde():
    return JSONResponse({"image": distributions.histograma_kde()})

@app.get("/analytics/distribucion/luxes-plotly")
def get_hist_plotly():
    return JSONResponse({"figure": distributions.histograma_plotly()})

@app.get("/analytics/boxplot/tipo")
def get_boxplot_tipo():
    return JSONResponse({"image": distributions.boxplot_tipo()})

@app.get("/analytics/boxplot/facultad")
def get_boxplot_facultad():
    return JSONResponse({"image": distributions.boxplot_facultad()})

@app.get("/analytics/violin/tipo-estado")
def get_violin():
    return JSONResponse({"image": distributions.violin_tipo_estado()})

@app.get("/analytics/ecdf/luxes")
def get_ecdf():
    return JSONResponse({"image": distributions.ecdf_luxes()})

@app.get("/analytics/countplot/tipo-estado")
def get_countplot():
    return JSONResponse({"image": distributions.countplot_tipo_estado()})

@app.get("/analytics/correlacion/matriz")
def get_corr_matrix():
    return JSONResponse({"image": correlations.matriz_correlacion()})

@app.get("/analytics/scatter/altura-luxes")
def get_scatter_static():
    return JSONResponse({"image": comparison.scatter_altura_luxes()})

@app.get("/analytics/scatter/altura-luxes-plotly")
def get_scatter_plotly():
    return JSONResponse({"figure": comparison.scatter_altura_luxes_plotly()})

@app.get("/analytics/tipo/donut")
def get_donut():
    return JSONResponse({"figure": comparison.donut_tipo()})

@app.get("/analytics/tipo-estado/heatmap-altair")
def get_heatmap_altair():
    return comparison.tipo_estado_heatmap_altair()

@app.get("/analytics/sparklines/grupos")
def get_sparklines():
    return JSONResponse({"image": comparison.sparklines_grupos()})

@app.get("/analytics/facultad/ranking-luxes")
def get_ranking_luxes():
    return JSONResponse({"figure": faculty_analysis.ranking_luxes_plotly()})

@app.get("/analytics/facultad/stacked-estado")
def get_stacked():
    return JSONResponse({"image": faculty_analysis.stacked_estado_facultad()})

@app.get("/analytics/facultad/radar")
def get_radar(facultad: str = Query(None)):
    return JSONResponse({"figure": faculty_analysis.radar_facultad(facultad)})

@app.get("/analytics/facultad/treemap")
def get_treemap():
    return JSONResponse({"figure": faculty_analysis.treemap_plotly()})

@app.get("/analytics/facultad/led-adopcion")
def get_led_adopcion():
    return JSONResponse({"figure": faculty_analysis.led_adopcion_plotly()})

@app.get("/analytics/red/proximidad-png")
def get_grafo_png(threshold: int = Query(50)):
    return JSONResponse({"image": network_analysis.grafo_proximidad_png(threshold)})

@app.get("/analytics/red/proximidad-plotly")
def get_grafo_plotly(threshold: int = Query(50)):
    return JSONResponse({"figure": network_analysis.grafo_proximidad_plotly(threshold)})

@app.get("/analytics/red/comunidades")
def get_comunidades(threshold: int = Query(50)):
    return network_analysis.comunidades_json(threshold)

@app.get("/analytics/missing/heatmap")
def get_missing_heatmap():
    return JSONResponse({"image": missing_data.missing_heatmap()})

@app.get("/analytics/missing/por-facultad")
def get_missing_facultad():
    return JSONResponse({"figure": missing_data.missing_por_facultad_plotly()})

@app.get("/analytics/missing/cobertura")
def get_cobertura():
    return JSONResponse({"figure": missing_data.cobertura_medicion()})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
