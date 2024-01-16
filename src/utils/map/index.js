import { Map, View } from 'ol';
import { defaults as defaultInteractions, DragRotateAndZoom } from 'ol/interaction';
import { createFeaturesLayer, createSelectedFeaturesLayer } from './feature';
import { createTileLayer } from './tileLayer';
import { getEpsgCode } from 'utils/helpers/map';
import { createEmpty, extend } from 'ol/extent';
import { selectFeature } from 'store/slices/mapSlice';
import store from 'store';

const MAP_PADDING = [50, 50, 50, 50];

export default async function createMap(featureCollection) {
   const epsgCode = getEpsgCode(featureCollection);
   const featuresLayer = createFeaturesLayer(featureCollection);
   
   const map = new Map({
      interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
      layers: [
         await createTileLayer(epsgCode),
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

   map.on('click', async event => {
      handleMapClick(event, map, featuresLayer);
   })

   map.setView(new View({
      padding: MAP_PADDING,
      projection: epsgCode,
      //constrainResolution: true
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

function isEditMode() {
   return store.getState().map.editMode;
}