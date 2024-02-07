import { Cluster, Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { GeoJSON } from 'ol/format';
import { Style } from 'ol/style';
import { getEpsgCode, getLayer, getVectorSource, readGeoJsonFeature } from 'utils/helpers/map';
import { clusterStyle, createFeatureStyle } from './style';
import environment from 'config/environment';

export function createFeaturesLayer(featureCollection) {
   const vectorSource = new VectorSource();
   const reader = new GeoJSON();
   const epsgCode = getEpsgCode(featureCollection);

   const features = featureCollection.features
      .map(feature => {
         const olFeature = reader.readFeature(feature, { dataProjection: epsgCode, featureProjection: environment.MAP_EPSG });

         olFeature.setStyle(createFeatureStyle('#3767c7', '#3767c75e'));
         olFeature.set('_visible', true);
         olFeature.set('_coordinates', feature.geometry?.coordinates);
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

   // const disabledSource = new VectorSource({
   //    features
   // });

   vectorLayer.set('id', 'features');
   vectorLayer.set('_isCluster', true);
   vectorLayer.set('_disabledSource', vectorSource);

   return vectorLayer;
}

export function createSelectedFeaturesLayer() {
   const vectorLayer = new VectorLayer({
      source: new VectorSource(),
      declutter: true,
      zIndex: 2
   });

   vectorLayer.set('id', 'selected-features');

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

   feature.setStyle(createFeatureStyle('#3767c7', '#3767c75e'));
   feature.set('_visible', true);
   feature.set('_featureType', 'default');

   return feature;
}

export function addFeatureToMap(map, feature, layerName = 'features') {
   const vectorLayer = getLayer(map, layerName);

   if (layerName === 'features') {
      let vectorSource = vectorLayer.getSource();
      //let disabledSource = vectorLayer.get('_disabledSource');

      if (vectorSource.get('id') === 'cluster-source') {
         vectorSource = vectorSource.getSource();
      } 
      // else {
      //    disabledSource = disabledSource.getSource();
      // }

      vectorSource.addFeature(feature);
      //disabledSource.addFeature(feature);
   } else {
      const vectorSource = vectorLayer.getSource();
      vectorSource.addFeature(feature);
   }
}

export function removeFeatureFromMap(map, feature, layerName = 'features') {
   const vectorLayer = getLayer(map, layerName);

   if (layerName === 'features') {
      let vectorSource = vectorLayer.getSource();
      //let disabledSource = vectorLayer.get('_disabledSource');

      if (vectorSource.get('id') === 'cluster-source') {
         vectorSource = vectorSource.getSource();
      } 
      // else {
      //    disabledSource = disabledSource.getSource();
      // }

      vectorSource.removeFeature(feature);
      // disabledSource.removeFeature(feature);
   } else {
      const vectorSource = vectorLayer.getSource();
      vectorSource.removeFeature(feature);
   }
}

export function toggleFeature(feature) {
   const visible = !feature.get('_visible');

   if (visible) {
      const savedStyle = feature.get('_savedStyle');
      feature.setStyle(savedStyle);
   } else {
      feature.set('_savedStyle', feature.getStyle());
      feature.setStyle(new Style(null));
   }

   feature.set('_visible', visible);
}

export function highlightFeature(map, feature) {
   const layer = getLayer(map, 'features');
   const source = getVectorSource(layer);
   const highlighted = layer.get('_highlightedFeature');

   if (highlighted) {
      const highlightedFeature = source.getFeatures()
         .find(feature => feature.get('id').value === highlighted.featureId && feature.get('_featureType') === highlighted.featureType);

      if (highlightedFeature) {
         const savedStyle = highlightedFeature.get('_savedStyle');
         highlightedFeature.setStyle(savedStyle);
      }
   }

   const style = feature.getStyle();
   feature.set('_savedStyle', style);
   feature.setStyle(createFeatureStyle('#fe5000', '#fe50005e', 2));

   layer.set('_highlightedFeature', {
      featureId: feature.get('id').value,
      featureType: feature.get('_featureType')
   });
}

export function setNextAndPreviousFeatureId(map, feature) {
   const layer = getLayer(map, 'features');
   const source = getVectorSource(layer);
   const features = source.getFeatures();

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

