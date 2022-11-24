import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorSource from "ol/source/Vector";
import { Fill, RegularShape, Stroke, Style } from "ol/style";
import { useContext, useEffect, useState } from "react";
import { ColorContext, Triangle_colors } from "../../context/ColorContext";
import { mapLayerContext } from "../../context/MapLayerConext";
import { transformToOpenLayerProjection } from "../../supportFunctions";

const getTriangleStyle = (color?: string) => {
  return new Style({
    image: new RegularShape({
      fill: new Fill({ color: color ?? Triangle_colors.red }),
      stroke: new Stroke({ color: "#000000", width: 2 }),
      points: 3,
      radius: 30,
      angle: 0,
    }),
  });
};

const coordinate = transformToOpenLayerProjection([-115.065, 36.2322]);
const triangleFeature = new Feature(new Point(coordinate));
triangleFeature.setStyle(getTriangleStyle());
const TriangleSource = new VectorSource({ features: [triangleFeature] });

const SECOND = 1000;

export const TriangleLayer: React.FC = () => {
  const [updateColor, setUpdateColor] = useState<boolean>(false);

  const mapLayerApi = useContext(mapLayerContext);
  const colorContext = useContext(ColorContext);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateColor((prev) => !prev);
    }, SECOND); //update triangle layer every half second using color context
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    TriangleSource.getFeatures()[0].setStyle(
      getTriangleStyle(colorContext.color)
    );
    mapLayerApi.triangleLayer().setSource(TriangleSource);
  }, [updateColor]);

  return null;
};
