import {Coordinate} from 'ol/coordinate';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import {Icon, Style} from 'ol/style';
import {useContext, useEffect, useState} from 'react';
import {mapLayerContext} from '../../context/MapLayerConext';
import {transformToOpenLayerProjection} from '../../supportFunctions';
import planeIcon from '../../resources/svg/plane.svg';
import {circular} from 'ol/geom/Polygon';

const getOwnshipStyle = (rotation?: number) => {
  return new Style({
    image: new Icon({
      src: planeIcon,
      rotation: rotation,
    }),
  });
};

const calculateAngleBetweenCoordinates = (coordOne: Coordinate, coordTwo: Coordinate) => {
  const dy = coordOne[0] - coordTwo[0];
  const dx = coordOne[1] - coordTwo[1];
  if (dx === 0) return Math.PI / 2;
  return Math.atan2(dy, dx); // range [-PI, PI]
};

const getOwnshipSource = (coords: Coordinate, rotation?: number) => {
  const coordinate = transformToOpenLayerProjection(coords);
  const ownshipFeature = new Feature(new Point(coordinate));
  ownshipFeature.setStyle(getOwnshipStyle(rotation));
  return new VectorSource({features: [ownshipFeature]});
};

/*Calculate length of coordinate array to replicate speed of jet
 * @param speedMPH: speed of jet in miles per hour
 * @param radius: radius of circle in meters
 * @param updateInterval: frequency of update of plane position in milliseconds
 *
 * @return {number} length of circle's coordinate array
 */
const calculateCircleCoordLength = (speedMPH: number, radius: number, updateInterval: number) => {
  const metersPerMile = 1 / 1609.34;
  const minutesPerHour = 60;
  const secondsPerMinute = 60;
  const millisecondsPerSecond = 1000;

  const intervalPerMilliseconds = 1 / updateInterval;
  const cirlceCircumferenceMeters = 2 * Math.PI * radius;
  return (
    cirlceCircumferenceMeters * metersPerMile * (1 / speedMPH) * minutesPerHour * secondsPerMinute * millisecondsPerSecond * intervalPerMilliseconds
  );
};

//CONSTANTS
const UPDATE_INTERVAL_MILLISECONDS = 500;
const RADIUS = 40000; //meters
const CENTER = [-115.065, 36.2322]; //[lon,lat]
const PLANE_SPEED_MPH = 600;

export const OwnshipLayer: React.FC = () => {
  const [update, setUpdate] = useState<number>(Date.now());
  const [timer, setTimer] = useState<NodeJS.Timer>();
  const [coordIndex, setCoordIndex] = useState<number>(0);
  const [circleCoords, setCircleCoords] = useState<Coordinate[]>([]);

  const mapLayerApi = useContext(mapLayerContext);

  useEffect(() => {
    //Initialize circle Coords
    const numberOfVertices = calculateCircleCoordLength(PLANE_SPEED_MPH, RADIUS, UPDATE_INTERVAL_MILLISECONDS);
    const olCircle = circular(CENTER, RADIUS, numberOfVertices);
    const olCircleFeature = new Feature({geometry: olCircle});
    setCircleCoords(olCircleFeature.getGeometry()?.getCoordinates()[0] ?? []);

    createIntervalTimer();
    return () => {
      clearIntervalTimer();
    };
  }, []);

  useEffect(() => {
    if (circleCoords.length > 0) {
      let prevIndex = coordIndex - 1 >= 0 ? coordIndex - 1 : 0;
      const planeRotation = calculateAngleBetweenCoordinates(circleCoords[coordIndex], circleCoords[prevIndex]);
      mapLayerApi.ownshipLayer().setSource(getOwnshipSource(circleCoords[coordIndex], planeRotation));

      if (coordIndex === circleCoords.length - 1) setCoordIndex(0); //set index back to 0 after last array element
      else setCoordIndex((prev) => prev + 1);
    }
  }, [update]);

  const createIntervalTimer = () => {
    const interval = setInterval(() => {
      setUpdate(Date.now());
    }, UPDATE_INTERVAL_MILLISECONDS);
    setTimer(interval);
  };

  const clearIntervalTimer = () => {
    if (timer) clearInterval(timer);
  };

  return null;
};
