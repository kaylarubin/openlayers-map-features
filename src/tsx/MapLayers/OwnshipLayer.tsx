import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import { Icon, Style } from "ol/style";
import { useContext, useEffect, useState } from "react";
import { mapLayerContext } from "../../context/MapLayerConext";
import { transformToOpenLayerProjection } from "../../supportFunctions";
import planeIcon from "../resources/svg/plane.svg";
import { fromCircle } from "ol/geom/Polygon";
import { Circle } from "ol/geom";

const HALF_SECOND = 500;

//Circle constants
const RADIUS = 0.3; //in unit of projection
const CENTER = [-115, 36.5]; //[lon,lat]
const CIRCLE_COORDS_ARRAY_LENGTH = 1500;
const STARTING_ANGLE = 0;
const olCircle = new Circle(CENTER, RADIUS);
const olPolygonCircle = fromCircle(
  olCircle,
  CIRCLE_COORDS_ARRAY_LENGTH,
  STARTING_ANGLE
);
const olCircleFeature = new Feature({ geometry: olPolygonCircle });
const CIRCLE_COORDS = olCircleFeature.getGeometry()?.getCoordinates()[0] ?? [];

const getOwnshipStyle = (rotation?: number) => {
  return new Style({
    image: new Icon({
      src: planeIcon,
      rotation: rotation,
    }),
  });
};

const calculateAngleBetweenCoordinates = (
  coordOne: Coordinate,
  coordTwo: Coordinate
) => {
  const dy = coordOne[0] - coordTwo[0];
  const dx = coordOne[1] - coordTwo[1];
  return Math.atan2(dy, dx); // range [-PI, PI]
};

const getOwnshipSource = (coords: Coordinate, rotation?: number) => {
  const coordinate = transformToOpenLayerProjection(coords);
  const ownshipFeature = new Feature(new Point(coordinate));
  ownshipFeature.setStyle(getOwnshipStyle(rotation));
  return new VectorSource({ features: [ownshipFeature] });
};

export const OwnshipLayer: React.FC = () => {
  const [update, setUpdate] = useState<number>(Date.now());
  const [timer, setTimer] = useState<NodeJS.Timer>();
  const [coordIndex, setCoordIndex] = useState<number>(0);

  const mapLayerApi = useContext(mapLayerContext);

  useEffect(() => {
    createIntervalTimer();
    return () => {
      clearIntervalTimer();
    };
  }, []);

  useEffect(() => {
    let prevIndex = coordIndex - 1 >= 0 ? coordIndex - 1 : 0;
    const planeRotation = calculateAngleBetweenCoordinates(
      CIRCLE_COORDS[coordIndex],
      CIRCLE_COORDS[prevIndex]
    );
    mapLayerApi
      .ownshipLayer()
      .setSource(getOwnshipSource(CIRCLE_COORDS[coordIndex], planeRotation));

    if (coordIndex === CIRCLE_COORDS_ARRAY_LENGTH - 1)
      setCoordIndex(0); //set index back to 0 after last array element
    else setCoordIndex((prev) => prev + 1);
  }, [update]);

  const createIntervalTimer = () => {
    const interval = setInterval(() => {
      setUpdate(Date.now());
    }, HALF_SECOND);
    setTimer(interval);
  };

  const clearIntervalTimer = () => {
    if (timer) clearInterval(timer);
  };

  return null;
};
