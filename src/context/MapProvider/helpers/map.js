import { Map, View } from 'ol';
import { createRoutesFeaturesLayer, createFeaturesLayer, createFeaturesEditLayer } from './feature';
import { createTileLayer } from './tileLayer';
import { toggleClusteredFeatures, handleMapClick, setFeatureIdsInExtent, handleContextMenu } from './eventListeners';
import environment from 'config/environment';
import baseMap from 'config/map/baseMap';

const MAP_PADDING = [50, 50, 50, 50];

export default async function createMap(featureCollection) {
   const featuresLayer = createFeaturesLayer(featureCollection);

   const map = new Map({      
      layers: [
         await createTileLayer(),
         createRoutesFeaturesLayer(),
         featuresLayer,
         createFeaturesEditLayer()
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
      projection: environment.MAP_EPSG,
      maxZoom: baseMap.maxZoom
   }));

   return map;
}
