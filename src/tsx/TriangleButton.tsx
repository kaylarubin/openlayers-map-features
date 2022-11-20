import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import { Fill, RegularShape, Stroke, Style } from "ol/style";
import { useContext, useEffect, useState } from "react";
import { mapLayerContext } from "../context/MapLayerConext";
import { transformToOpenLayerProjection } from "../supportFunctions";

const getTriangleStyle = (color: string) => {
  return new Style({
    image: new RegularShape({
      fill: new Fill({ color: color }),
      stroke: new Stroke({ color: "black", width: 2 }),
      points: 3,
      radius: 30,
      angle: 0,
    }),
  });
};

const colors = {
  red: "red",
  yellow: "yellow",
  orange: "orange",
  green: "green",
  blue: "blue",
  purple: "#873CF7",
};

const spectrum = [
  colors.red,
  colors.orange,
  colors.yellow,
  colors.green,
  colors.blue,
  colors.purple,
];

const coordinate = transformToOpenLayerProjection([-115.065, 36.2322]);
const triangleFeature = new Feature(new Point(coordinate));
triangleFeature.setStyle(getTriangleStyle(colors.red));
const TriangleSource = new VectorSource({ features: [triangleFeature] });

const HALF_SECOND = 500;

export const TriangleButton: React.FC = () => {
  const [triangleButtonToggled, setTriangleButtonToggled] =
    useState<boolean>(false);
  const [nextColor, setNextColor] = useState<number>(0);
  const [updateColor, setUpdateColor] = useState<boolean>(false);
  const [colorTimer, setColorTimer] = useState<NodeJS.Timer>();

  const mapLayerApi = useContext(mapLayerContext);

  useEffect(() => {
    return () => {
      clearInterval(colorTimer);
    };
  }, []);

  useEffect(() => {
    if (triangleButtonToggled) {
      TriangleSource.getFeatures()[0].setStyle(
        getTriangleStyle(spectrum[nextColor])
      );
      mapLayerApi.triangleLayer().setSource(TriangleSource);
    }

    if (nextColor === spectrum.length - 1) setNextColor(0);
    else setNextColor((prev) => prev + 1);
  }, [updateColor]);

  const createIntervalTimer = () => {
    const interval = setInterval(() => {
      setUpdateColor((prev) => !prev);
    }, HALF_SECOND);
    setColorTimer(interval);
  };

  const clearIntervalTimer = () => {
    if (colorTimer) clearInterval(colorTimer);
  };

  const handleButtonClick = () => {
    if (!triangleButtonToggled) {
      mapLayerApi.triangleLayer().setSource(TriangleSource);
      createIntervalTimer();
    } else {
      mapLayerApi.triangleLayer().setSource(null);
      clearIntervalTimer();
    }
    setTriangleButtonToggled((prev) => !prev);
  };

  return <button onClick={handleButtonClick}>Show Triangle</button>;
};
