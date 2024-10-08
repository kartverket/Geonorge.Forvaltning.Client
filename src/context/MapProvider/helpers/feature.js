import { Cluster, Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { GeoJSON } from 'ol/format';
import { getEpsgCode, getLayer, getVectorSource, readGeoJsonFeature } from 'utils/helpers/map';
import { clusterStyle, featureStyle } from './style';
import environment from 'config/environment';

export function createFeaturesLayer(featureCollection) {
   const vectorSource = new VectorSource();
   const reader = new GeoJSON();
   const epsgCode = getEpsgCode(featureCollection);

   const features = featureCollection.features
      .map(feature => {
         const olFeature = reader.readFeature(feature, { dataProjection: epsgCode, featureProjection: environment.MAP_EPSG });

         olFeature.setStyle(featureStyle);
         olFeature.set('_visible', true);
         olFeature.set('_coordinates', feature.geometry?.coordinates);
         olFeature.set('_tag', feature?.tag);
         olFeature.set('_featureType', 'default');

         return olFeature;
      });

   vectorSource.addFeatures(features);

   const clusterSource = new Cluster({
      source: vectorSource,
      distance: 35
   });

   clusterSource.set('id', 'cluster-source');

   const vectorLayer = new VectorLayer({
      source: clusterSource,
      style: clusterStyle
   });

   vectorLayer.set('id', 'features');
   vectorLayer.set('_isCluster', true);
   vectorLayer.set('_disabledSource', vectorSource);

   return vectorLayer;
}

export function createRoutesFeaturesLayer() {
   const vectorLayer = new VectorLayer({
      source: new VectorSource(),
   });

   vectorLayer.set('id', 'routes');

   return vectorLayer;
}

export function createFeature(geoJson) {
   const feature = readGeoJsonFeature(geoJson);

   feature.setStyle(featureStyle);
   feature.set('_visible', true);      
   feature.set('_featureType', 'default');

   return feature;
}

export function addFeatureToMap(map, feature, layerName = 'features') {
   const vectorLayer = getLayer(map, layerName);
   const vectorSource = getVectorSource(vectorLayer);

   vectorSource.addFeature(feature);
}

export function removeFeatureFromMap(map, feature, layerName = 'features') {
   const vectorLayer = getLayer(map, layerName);
   const vectorSource = getVectorSource(vectorLayer);

   vectorSource.removeFeature(feature);
}

export function toggleFeature(feature) {
   feature.set('_visible', !feature.get('_visible'));
}

export function highlightFeature(map, feature) {
   const vectorLayer = getLayer(map, 'features');
   const selectedFeature = vectorLayer.get('_selectedFeature');

   if (selectedFeature) {
      selectedFeature.set('_selected', false);
   }

   if (feature !== null) {
      feature.set('_selected', true);
      vectorLayer.set('_selectedFeature', feature);
   }
}

export function setNextAndPreviousFeatureId(map, feature) {
   const vectorLayer = getLayer(map, 'features');
   const vectorSource = getVectorSource(vectorLayer);
   const features = vectorSource.getFeatures();

   if (features.length <= 1) {
      feature.set('_nextFeature', null);
      feature.set('_prevFeature', null);
   }

   const featureIds = features
      .map(feature => feature.get('id').value)
      .sort();

   const thisId = feature.get('id').value;
   const index = featureIds.indexOf(thisId);
   let prevIndex, nextIndex;

   if (index === 0) {
      prevIndex = featureIds.length - 1;
      nextIndex = index + 1;
   } else if (index === featureIds.length - 1) {
      prevIndex = index - 1;
      nextIndex = 0;
   } else {
      prevIndex = index - 1;
      nextIndex = index + 1;
   }

   feature.set('_nextFeature', featureIds[nextIndex]);
   feature.set('_prevFeature', featureIds[prevIndex]);
}

