import { useState, useRef, useEffect, useContext } from "react";

import "./styles/MapWrapper.css";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { OSM } from "ol/source";
import Feature from "ol/Feature";
import { Geometry, Point } from "ol/geom";
import GeoJSON from "ol/format/GeoJSON";
import { default as TurfCircle } from "@turf/circle";
import union from "@turf/union";
import { transform } from "ol/proj";
import { Fill, RegularShape, Stroke, Style } from "ol/style";
import { Coordinate } from "ol/coordinate";
import { TriangleButton } from "./TriangleButton";
import { transformToOpenLayerProjection } from "./supportFunctions";
import { TriangleLayerContext } from "./context/TriangleLayerContext";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { get as getProjection } from "ol/proj";
import { getTopLeft, getWidth } from "ol/extent";

const circleStyle = new Style({
  stroke: new Stroke({
    color: "red",
    width: 3,
  }),
  fill: new Fill({
    color: "rgba(0, 0, 255, 0.1)",
  }),
});

const threatRings: ThreatRing[] = [
  { lat: 36.2322, lon: -115.065, radius: 40 },
  { lat: 36.2322, lon: -115.865, radius: 40 },
  { lat: 36.2322, lon: -114, radius: 40 },
];

const ringCenter = [-115.065, 36.2322];
const slcCenter = [-111.9905247, 40.7767168];

const matrixSetProjection = "EPSG:900913";
const formatType = "image/png";
const projection = getProjection(matrixSetProjection);
const projectionExtent = projection!.getExtent();
const size = getWidth(projectionExtent) / 256;
const resolutions = new Array(14);
const matrixIds = new Array(14);
for (let z = 0; z < 14; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = `${matrixSetProjection}:${z}`;
}

interface ThreatRing {
  lat: number;
  lon: number;
  radius: number;
}

function MapWrapper() {
  console.log("mapWrapper re-rendered");
  // set intial state - used to track references to OpenLayers
  //  objects for use in hooks, event handlers, etc.
  const [map, setMap] = useState<Map>();

  // get ref to div element - OpenLayers will render into this div
  let mapElement = useRef<HTMLDivElement>(null);

  const triangleContext = useContext(TriangleLayerContext);

  useEffect(() => {
    //Create array of turf circles
    const turfCircles = new Array<any>();
    threatRings.forEach((threatRing: ThreatRing) => {
      const center = [threatRing.lon, threatRing.lat];
      const turfCircle = TurfCircle(center, threatRing.radius);
      turfCircles.push(turfCircle);
    });

    //create single turf feature from all turf circles
    let unionFeature: any;
    for (var i = 1; i < turfCircles.length; i++) {
      if (i === 1) {
        unionFeature = union(turfCircles[i - 1], turfCircles[i]);
      } else {
        unionFeature = union(unionFeature, turfCircles[i]);
      }
    }

    //convert turf feature to openlayers feature
    const olCircleFeature: Feature<Geometry> = new GeoJSON().readFeature(
      unionFeature
    );
    olCircleFeature.setId("unionFeature");
    olCircleFeature.getGeometry()?.transform("EPSG:4326", "EPSG:3857");
    olCircleFeature.setStyle(circleStyle);

    const initialTriangleLayer = new VectorLayer<VectorSource<Geometry>>();

    const initialMap = new Map({
      target: mapElement.current!,
      layers: [
        new TileLayer({
          source: new OSM(),
          visible: true,
        }),
        new TileLayer({
          source: new WMTS({
            url: "http://localhost:8080/geoserver/gwc/service/wmts?",
            layer: "test:merged",
            matrixSet: matrixSetProjection,
            format: formatType,
            projection: projection!,
            tileGrid: new WMTSTileGrid({
              origin: getTopLeft(projectionExtent),
              resolutions: resolutions,
              matrixIds: matrixIds,
            }),
            style: "",
          }),
        }),
        // new VectorLayer({
        //   source: new VectorSource({
        //     features: [olCircleFeature],
        //   }),
        // }),
        // initialTriangleLayer,
      ],
      view: new View({
        center: transformToOpenLayerProjection(slcCenter),
        zoom: 9,
      }),
    });

    // save map and vector layer references to state
    setMap(initialMap);
    triangleContext.setTriangleLayer(initialTriangleLayer);

    //cleanup
    return () => {
      initialMap.setTarget("");
    };
  }, []);

  return (
    <>
      {/* <TriangleButton /> */}
      <div ref={mapElement} className="map-container" />
    </>
  );
}

export default MapWrapper;
