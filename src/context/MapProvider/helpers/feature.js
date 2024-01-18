import { Cluster, Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { GeoJSON } from 'ol/format';
import { Style } from 'ol/style';
import { getEpsgCode, getLayer, getVectorSource, readGeoJsonFeature, transformCoordinates } from 'utils/helpers/map';
import { clusterStyle, getFeatureStyle } from './style';
import environment from 'config/environment';

export function createFeaturesLayer(featureCollection) {
   const vectorSource = new VectorSource();
   const reader = new GeoJSON();
   const epsgCode = getEpsgCode(featureCollection);

   const features = featureCollection.features
      .map(feature => {
         const olFeature = reader.readFeature(feature, { dataProjection: epsgCode, featureProjection: environment.MAP_EPSG });

         olFeature.setStyle(getFeatureStyle(7, 8));
         olFeature.set('_visible', true);
         olFeature.set('_coordinates', feature.geometry?.coordinates);
         
         return olFeature;
      });

   vectorSource.addFeatures(features);

   const clusterSource = new Cluster({
      source: vectorSource,
      distance: 35
   });

   clusterSource.set('id', 'cluster-source');

   const featuresLayer = new VectorLayer({
      source: clusterSource,
      style: clusterStyle
   });

   featuresLayer.set('id', 'features');

   return featuresLayer;
}

export function createSelectedFeaturesLayer() {
   const selectedFeaturesLayer = new VectorLayer({
      source: new VectorSource(),
      declutter: true,
      zIndex: 999
   });

   selectedFeaturesLayer.set('id', 'selected-features');

   return selectedFeaturesLayer;
}

export function createFeature(geoJson) {
   const feature = readGeoJsonFeature(geoJson);
   feature.setStyle(getFeatureStyle(7, 8));
   feature.set('_visible', true);

   return feature;
}

export function addFeatureToMap(map, feature, layerName = 'features') {
   const layer = getLayer(map, layerName);
   const source = getVectorSource(layer);

   source.addFeature(feature);
}

export function removeFeatureFromMap(map, feature, layerName = 'features') {
   const layer = getLayer(map, layerName);
   const source = getVectorSource(layer);

   source.removeFeature(feature);
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

// export function highlightFeature(map, feature) {
//    const layer = getLayer(map, 'selected-features');
//    const source = getVectorSource(layer);
//    source.clear();

//    const cloned = feature.clone();
//    cloned.setStyle(createStyle(11, 4));

//    source.addFeature(cloned);
// }

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

