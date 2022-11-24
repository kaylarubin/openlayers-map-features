import '../styles/MapWrapper.css';

import React, {useContext, useEffect, useRef} from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {OSM} from 'ol/source';
import Feature from 'ol/Feature';
import {Geometry} from 'ol/geom';
import GeoJSON from 'ol/format/GeoJSON';
import {default as TurfCircle} from '@turf/circle';
import union from '@turf/union';
import {Fill, Stroke, Style} from 'ol/style';
import {transformToOpenLayerProjection} from '../supportFunctions';
import {mapLayerContext} from '../context/MapLayerConext';
import {TriangleLayer} from './MapLayers/TriangleLayer';
import {OwnshipLayer} from './MapLayers/OwnshipLayer';
import {MapLayerButton} from './MapLayerButton';

//Interfaces
interface ThreatRing {
  lat: number;
  lon: number;
  radius: number;
}

//Enums
enum MapLayer {
  TRIANGLE_LAYER,
  OWNSHIP_LAYER,
}

//Constants
const circleStyle = new Style({
  stroke: new Stroke({
    color: 'red',
    width: 3,
  }),
  fill: new Fill({
    color: 'rgba(0, 0, 255, 0.1)',
  }),
});

const threatRings: ThreatRing[] = [
  {lat: 36.2322, lon: -115.065, radius: 40},
  {lat: 36.2322, lon: -115.865, radius: 40},
  {lat: 36.2322, lon: -114, radius: 40},
];

const nellis = [-115.065, 36.2322];

const MapWrapper: React.FC = () => {
  // get ref to div element - OpenLayers will render into this div
  let mapElement = useRef<HTMLDivElement>(null);

  const mapLayerApi = useContext(mapLayerContext);

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
    const olCircleFeature: Feature<Geometry> = new GeoJSON().readFeature(unionFeature);
    olCircleFeature.setId('unionFeature');
    olCircleFeature.getGeometry()?.transform('EPSG:4326', 'EPSG:3857');
    olCircleFeature.setStyle(circleStyle);

    const initialMap = new Map({
      target: mapElement.current!,
      layers: [
        new TileLayer({
          source: new OSM(),
          visible: true,
        }),
        new VectorLayer({
          source: new VectorSource({
            features: [olCircleFeature],
          }),
        }),
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
      initialMap.setTarget('');
    };
  }, []);

  const clearMapLayer = (layer: MapLayer) => {
    switch (layer) {
      case MapLayer.TRIANGLE_LAYER:
        mapLayerApi.triangleLayer().setSource(null);
        break;
      case MapLayer.OWNSHIP_LAYER:
        mapLayerApi.ownshipLayer().setSource(null);
        break;
    }
    return null;
  };

  return (
    <>
      <MapLayerButton text={'Show Triangle'} toggledState={mapLayerApi.triangleLayerToggled} setToggledState={mapLayerApi.setTriangleLayerToggled} />
      <MapLayerButton text={'Show Plane'} toggledState={mapLayerApi.ownshipLayerToggled} setToggledState={mapLayerApi.setOwnshipLayerToggled} />

      {mapLayerApi.ownshipLayerToggled ? <OwnshipLayer /> : clearMapLayer(MapLayer.OWNSHIP_LAYER)}
      {mapLayerApi.triangleLayerToggled ? <TriangleLayer /> : clearMapLayer(MapLayer.TRIANGLE_LAYER)}

      <div ref={mapElement} className="map-container" />
    </>
  );
};

export default MapWrapper;
