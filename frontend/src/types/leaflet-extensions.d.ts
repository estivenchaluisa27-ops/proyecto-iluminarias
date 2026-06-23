import 'leaflet';

declare module 'leaflet' {
  namespace HeatLayer {
    interface Options {
      radius?: number;
      blur?: number;
      maxZoom?: number;
      max?: number;
      gradient?: Record<number, string>;
      minOpacity?: number;
    }
  }

  function heatLayer(
    latlngs: Array<[number, number, number]>,
    options?: HeatLayer.Options
  ): HeatLayer;

  class HeatLayer extends Layer {
    constructor(
      latlngs: Array<[number, number, number]>,
      options?: HeatLayer.Options
    );
    setLatLngs(latlngs: Array<[number, number, number]>): this;
    addLatLng(latlng: [number, number, number]): this;
    setOptions(options: HeatLayer.Options): this;
    redraw(): this;
  }

  namespace control {
    function fullscreen(options?: Record<string, unknown>): Control.Fullscreen;
    function minimap(
      layer: TileLayer,
      options?: Record<string, unknown>
    ): Control.MiniMap;
    function search(options?: Record<string, unknown>): Control.Search;
  }

  namespace Control {
    class Fullscreen extends Control {
      constructor(options?: Record<string, unknown>);
    }
    class MiniMap extends Control {
      constructor(layer: TileLayer, options?: Record<string, unknown>);
    }
    class Search extends Control {
      constructor(options?: Record<string, unknown>);
    }
  }
}
