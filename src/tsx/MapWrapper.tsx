import "../styles/MapWrapper.css";

import React, { useContext, useEffect, useRef } from "react";
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
import { transformToOpenLayerProjection } from "../supportFunctions";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { get as getProjection } from "ol/proj";
import { getTopLeft, getWidth } from "ol/extent";
import { mapLayerContext } from "../context/MapLayerConext";
import { OwnshipLayer } from "./OwnshipLayer";

// const circleStyle = new Style({
//   stroke: new Stroke({
//     color: "red",
//     width: 3,
//   }),
//   fill: new Fill({
//     color: "rgba(0, 0, 255, 0.1)",
//   }),
// });

// const threatRings: ThreatRing[] = [
//   { lat: 36.2322, lon: -115.065, radius: 40 },
//   { lat: 36.2322, lon: -115.865, radius: 40 },
//   { lat: 36.2322, lon: -114, radius: 40 },
// ];

// const ringCenter = [-115.065, 36.2322];
// const slcCenter = [-111.9905247, 40.7767168];
const nellis = [-115.065, 36.2322];

// interface ThreatRing {
//   lat: number;
//   lon: number;
//   radius: number;
// }

const MapWrapper: React.FC = () => {
  // get ref to div element - OpenLayers will render into this div
  let mapElement = useRef<HTMLDivElement>(null);

  const mapLayerApi = useContext(mapLayerContext);

  useEffect(() => {
    // //Create array of turf circles
    // const turfCircles = new Array<any>();
    // threatRings.forEach((threatRing: ThreatRing) => {
    //   const center = [threatRing.lon, threatRing.lat];
    //   const turfCircle = TurfCircle(center, threatRing.radius);
    //   turfCircles.push(turfCircle);
    // });

    // //create single turf feature from all turf circles
    // let unionFeature: any;
    // for (var i = 1; i < turfCircles.length; i++) {
    //   if (i === 1) {
    //     unionFeature = union(turfCircles[i - 1], turfCircles[i]);
    //   } else {
    //     unionFeature = union(unionFeature, turfCircles[i]);
    //   }
    // }

    // //convert turf feature to openlayers feature
    // const olCircleFeature: Feature<Geometry> = new GeoJSON().readFeature(
    //   unionFeature
    // );
    // olCircleFeature.setId("unionFeature");
    // olCircleFeature.getGeometry()?.transform("EPSG:4326", "EPSG:3857");
    // olCircleFeature.setStyle(circleStyle);

    const initialMap = new Map({
      target: mapElement.current!,
      layers: [
        new TileLayer({
          source: new OSM(),
          visible: true,
        }),
        // new VectorLayer({
        //   source: new VectorSource({
        //     features: [olCircleFeature],
        //   }),
        // }),
        mapLayerApi.triangleLayer(),
        mapLayerApi.ownshipLayer(),
      ],
      view: new View({
        center: transformToOpenLayerProjection(nellis),
        zoom: 9,
      }),
    });

    // save map and vector layer references to state
    mapLayerApi.setMap(initialMap);

    //cleanup
    return () => {
      initialMap.setTarget("");
    };
  }, []);

  return (
    <>
      <TriangleButton />
      <OwnshipLayer />
      <div ref={mapElement} className="map-container" />
    </>
  );
};

export default MapWrapper;
