import {createContext, useState, useRef} from 'react';
import {Geometry} from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Map from 'ol/Map';

interface MapLayerContext {
  map: Map;
  setMap: (m: Map) => void;
  triangleLayer: () => VectorLayer<VectorSource<Geometry>>;
  ownshipLayer: () => VectorLayer<VectorSource<Geometry>>;
  triangleLayerToggled: boolean;
  setTriangleLayerToggled: (b: boolean) => void;
  ownshipLayerToggled: boolean;
  setOwnshipLayerToggled: (b: boolean) => void;
}

const initialState = {
  map: new Map({}),
  setMap: (m: Map) => {},
  triangleLayer: () => new VectorLayer<VectorSource<Geometry>>(),
  ownshipLayer: () => new VectorLayer<VectorSource<Geometry>>(),
  triangleLayerToggled: false,
  setTriangleLayerToggled: (b: boolean) => {},
  ownshipLayerToggled: false,
  setOwnshipLayerToggled: (b: boolean) => {},
};

export const mapLayerContext = createContext<MapLayerContext>(initialState);

export function MapLayerProvider({children}: {children: React.ReactNode}) {
  //map
  const [map, setMap] = useState<Map>(initialState.map);

  //mapLayer Refs
  const triangleLayerRef = useRef(new VectorLayer<VectorSource<Geometry>>());
  const movingOwnshipRef = useRef(new VectorLayer<VectorSource<Geometry>>());

  //button states
  const [triangleLayerToggled, setTriangleLayerToggled] = useState<boolean>(false);
  const [ownshipLayerToggled, setOwnshipLayerToggled] = useState<boolean>(false);

  //layer functions
  const triangleLayer = () => triangleLayerRef.current;
  const ownshipLayer = () => movingOwnshipRef.current;

  return (
    <mapLayerContext.Provider
      value={{
        map,
        setMap,
        triangleLayer,
        ownshipLayer,
        triangleLayerToggled,
        setTriangleLayerToggled,
        ownshipLayerToggled,
        setOwnshipLayerToggled,
      }}
    >
      {children}
    </mapLayerContext.Provider>
  );
}
