import { GeoJSON } from 'ol/format';
import { Stroke, Style } from 'ol/style';
import { createFeatureStyle } from 'context/MapProvider/helpers/style';
import { getLayer, getVectorSource } from 'utils/helpers/map';
import environment from 'config/environment';

export function addAnalysisFeaturesToMap(map, featureCollection) {
   addObjectsToMap(map, featureCollection);
   addRoutesToMap(map, featureCollection);
}

export function removeAnalysisFeaturesFromMap(map) {
   removeObjectsFromMap(map);
   removeRoutesFromMap(map);
}

export function highlightRoute(vectorLayer, route) {
   const vectorSource = getVectorSource(vectorLayer);
   const selectedRouteId = vectorLayer.get('_selectedRouteId');

   if (selectedRouteId) {
      const selected = vectorSource.getFeatures()
         .find(feature => feature.get('destinationId') === selectedRouteId);

      if (selected) {
         const savedStyle = selected.get('_savedStyle');
         selected.setStyle(savedStyle);
      }
   }

   const style = route.getStyle();

   route.set('_savedStyle', style);
   route.setStyle(createSelectedRouteStyle());

   vectorLayer.set('_selectedRouteId', route.get('destinationId'));
}

export function convertDistance(distance) {
   if (distance < 1000) {
      return `${Math.round(distance)} m`
   }

   const km = distance / 1000;
   const rounded = Math.round((km + Number.EPSILON) * 10) / 10;

   return `${new Intl.NumberFormat('nb-NO').format(rounded)} km`;
}

export function convertDuration(duration) {
   const hours = Math.floor(duration / 3600).toString().padStart(2, '0');
   const minutes = Math.floor(duration % 3600 / 60).toString().padStart(2, '0');
   const seconds = Math.floor(duration % 60).toString().padStart(2, '0');

   return `${hours}:${minutes}:${seconds}`;
}

function addObjectsToMap(map, featureCollection) {
   removeObjectsFromMap(map);

   const reader = new GeoJSON();

   const objects = featureCollection.features
      .filter(feature => feature.geometry?.type === 'Point')
      .map(feature => {
         const olFeature = reader.readFeature(feature, { dataProjection: `EPSG:${environment.DATASET_SRID}`, featureProjection: environment.MAP_EPSG });

         olFeature.setStyle(createFeatureStyle('#249446', '#2494465e'));
         olFeature.set('_visible', true);
         olFeature.set('_coordinates', feature.geometry?.coordinates);
         olFeature.set('_featureType', 'analysis');

         return olFeature;
      });

   const vectorLayer = getLayer(map, 'features');
   let vectorSource = vectorLayer.getSource();
   let disabledSource = vectorLayer.get('_disabledSource');
   
   if (vectorSource.get('id') === 'cluster-source') {
      vectorSource = vectorSource.getSource();
   } else {
      disabledSource = disabledSource.getSource();
   }

   vectorSource.addFeatures(objects);
   disabledSource.addFeatures(objects);
}

function addRoutesToMap(map, featureCollection) {
   removeRoutesFromMap(map);

   const vectorLayer = getLayer(map, 'routes');
   const vectorSource = getVectorSource(vectorLayer);
   const reader = new GeoJSON();

   const routes = featureCollection.features
      .filter(feature => feature.geometry?.type === 'LineString')
      .map(feature => {
         const olFeature = reader.readFeature(feature, { dataProjection: `EPSG:${environment.DATASET_SRID}`, featureProjection: environment.MAP_EPSG });

         olFeature.setStyle(createRouteStyle());

         return olFeature;
      });

   vectorSource.addFeatures(routes);
}

function removeObjectsFromMap(map) {
   const vectorLayer = getLayer(map, 'features');
   let vectorSource = vectorLayer.getSource();
   let disabledSource = vectorLayer.get('_disabledSource');

   if (vectorSource.get('id') === 'cluster-source') {
      vectorSource = vectorSource.getSource();
   } else {
      disabledSource = disabledSource.getSource();
   }

   vectorSource.getFeatures()
      .filter(feature => feature.get('_featureType') === 'analysis')
      .forEach(feature => {
         vectorSource.removeFeature(feature);
      });

   disabledSource.getFeatures()
      .filter(feature => feature.get('_featureType') === 'analysis')
      .forEach(feature => {
         disabledSource.removeFeature(feature);
      });
}

function removeRoutesFromMap(map) {
   const vectorLayer = getLayer(map, 'routes');
   const vectorSource = getVectorSource(vectorLayer);

   vectorSource.clear();
}

function createRouteStyle() {
   return new Style({
      stroke: new Stroke({
         width: 2,
         color: '#3767c7'
      })
   });
}

function createSelectedRouteStyle() {
   return [
      new Style({
         stroke: new Stroke({
            width: 2,
            color: '#3767c7'
         })
      }),
      new Style({
         stroke: new Stroke({
            color: '#3767c75e',
            width: 12
         })
      })
   ];
}

