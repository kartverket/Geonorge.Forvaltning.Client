import { Map, View } from 'ol';
import { defaults as defaultInteractions, DragRotateAndZoom } from 'ol/interaction';
import { createFeaturesLayer, createSelectedFeaturesLayer } from './feature';
import { createTileLayer } from './tileLayer';
import { toggleClusteredFeatures, handleMapClick, setFeatureIdsInExtent, handleContextMenu } from './eventListeners';
import environment from 'config/environment';

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

   map.on('contextmenu', event => {
      handleContextMenu(event, map);
   });

   map.on('click', event => {
      handleMapClick(event, map);
   });

   map.on('moveend', () => {
      setFeatureIdsInExtent(map);
   });

   map.on('moveend', () => {
      toggleClusteredFeatures(map);
   });

   map.setView(new View({
      padding: MAP_PADDING,
      projection: environment.MAP_EPSG
   }));

   return map;
}
