import { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { createContext, useState } from "react";

const initialState = {
  triangleLayer: new VectorLayer<VectorSource<Geometry>>(),
  setTriangleLayer: (layer: VectorLayer<VectorSource<Geometry>>) => {},
};

export const TriangleLayerContext = createContext(initialState);

export function TriangleLayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [triangleLayer, setTriangleLayer] = useState<
    VectorLayer<VectorSource<Geometry>>
  >(new VectorLayer<VectorSource<Geometry>>());
  return (
    <TriangleLayerContext.Provider value={{ triangleLayer, setTriangleLayer }}>
      {children}
    </TriangleLayerContext.Provider>
  );
}
