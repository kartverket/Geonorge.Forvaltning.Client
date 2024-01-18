import TileLayer from 'ol/layer/Tile';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import { WMTSCapabilities } from 'ol/format';
import axios from 'axios';
import baseMap from 'config/map/baseMap';
import environment from 'config/environment';

export async function createTileLayer() {
   const options = await getWmtsOptions();

   if (options === null) {
      return null;
   }

   const tileLayer = new TileLayer({
      source: new WMTS(options),
      maxZoom: baseMap.maxZoom   
   });

   tileLayer.set('id', 'baseMap');

   return tileLayer;
}

async function getWmtsOptions() {
   let response;

   try {
      response = await axios.get(baseMap.wmtsUrl, { timeout: 2000 });
   } catch {
      return null;
   }

   const capabilities = new WMTSCapabilities().read(response.data);

   return optionsFromCapabilities(capabilities, {
      layer: baseMap.layer,
      matrixSet: environment.MAP_EPSG
   });
}