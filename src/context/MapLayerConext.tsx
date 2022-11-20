import { createContext, useState, useRef } from "react";
import { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Map from "ol/Map";

interface MapLayerContext {
  map: Map;
  setMap: (m: Map) => void;
  triangleLayer: () => VectorLayer<VectorSource<Geometry>>;
}

const initialState = {
  map: new Map({}),
  setMap: (m: Map) => {},
  triangleLayer: () => new VectorLayer<VectorSource<Geometry>>(),
};

export const mapLayerContext = createContext<MapLayerContext>(initialState);

export function MapLayerProvider({ children }: { children: React.ReactNode }) {
  //map
  const [map, setMap] = useState<Map>(initialState.map);

  //mapLayer Refs
  const triangleLayerRef = useRef(new VectorLayer<VectorSource<Geometry>>());

  //layer functions
  const triangleLayer = () => {
    return triangleLayerRef.current;
  };

  return (
    <mapLayerContext.Provider
      value={{
        map,
        setMap,
        triangleLayer,
      }}
    >
      {children}
    </mapLayerContext.Provider>
  );
}
