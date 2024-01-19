import { Map, View } from 'ol';
import { defaults as defaultInteractions, DragRotateAndZoom } from 'ol/interaction';
import { createFeaturesLayer, createSelectedFeaturesLayer } from './feature';
import { createTileLayer } from './tileLayer';
import { createEmpty, extend } from 'ol/extent';
import { selectFeature, setFeaturesInExtent } from 'store/slices/mapSlice';
import store from 'store';
import environment from 'config/environment';
import { getLayer, getVectorSource } from 'utils/helpers/map';
import { point as createPoint } from '@turf/helpers';
import getDistance from '@turf/distance';
import { inPlaceSort } from 'fast-sort';
import { reproject } from 'reproject';

const MAP_PADDING = [50, 50, 50, 50];

export default async function createMap(featureCollection) {
   const featuresLayer = createFeaturesLayer(featureCollection);

   const map = new Map({
      interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
      layers: [
         await createTileLayer(),
         featuresLayer,
         createSelectedFeaturesLayer()
      ]
   });

   map.on('loadstart', () => {
      map.getTargetElement().classList.add('spinner');
   });

   map.on('loadend', () => {
      map.getTargetElement().classList.remove('spinner');
   });

   map.on('click', event => {
      handleMapClick(event, map, featuresLayer);
   })

   map.on('moveend', () => {
      setFeatureIdsInExtent(map);
   });

   map.setView(new View({
      padding: MAP_PADDING,
      projection: environment.MAP_EPSG
   }));

   return map;
}

async function handleMapClick(event, map, featuresLayer) {
   if (isEditMode()) {
      return;
   }

   const [clusterFeature] = await featuresLayer.getFeatures(event.pixel);

   if (!clusterFeature) {
      return;
   }

   const features = clusterFeature.get('features');

   if (features.length === 1) {
      store.dispatch(selectFeature({ id: features[0].get('id').value, zoom: true }));
   } else if (features.length > 1) {
      const extent = createEmpty();
      features.forEach(feature => extend(extent, feature.getGeometry().getExtent()));

      const view = map.getView();
      view.fit(extent, { duration: 500, padding: MAP_PADDING });
   }
}

function setFeatureIdsInExtent(map) {
   const view = map.getView();
   const point = createPoint(view.getCenter());
   const centerPoint = reproject(point, environment.MAP_EPSG, `EPSG:${environment.DATASET_SRID}`);
   const extent = view.calculateExtent(map.getSize());
   const layer = getLayer(map, 'features');
   const source = getVectorSource(layer);
   const features = [];

   source.forEachFeatureInExtent(extent, feature => {
      const distance = getDistance(centerPoint, feature.get('_coordinates'), { units: 'meters' });

      features.push({
         id: feature.get('id').value,
         distance
      });
   });

   inPlaceSort(features).by({ asc: feature => feature.distance });
   const featureIds = features.map(feature => feature.id);

   store.dispatch(setFeaturesInExtent(featureIds));
}

function isEditMode() {
   return store.getState().map.editMode;
}