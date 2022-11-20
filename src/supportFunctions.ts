import { Coordinate } from "ol/coordinate";
import { transform } from "ol/proj";

export const transformToOpenLayerProjection = (
  coord: Coordinate
): Coordinate => {
  return transform(coord, "EPSG:4326", "EPSG:3857");
};
