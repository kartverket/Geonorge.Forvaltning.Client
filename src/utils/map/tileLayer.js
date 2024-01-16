import TileLayer from 'ol/layer/Tile';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import TileWMS from 'ol/source/TileWMS';
import { WMTSCapabilities } from 'ol/format';
import axios from 'axios';
import baseMap from 'config/map/baseMap';

export async function createTileLayer(projection) {
   let tileLayer = await createTileLayerWmts(projection);

   if (tileLayer === null) {
      tileLayer = createTileLayerWms();
   }

   tileLayer.set('id', 'baseMap');

   return tileLayer;
}

async function createTileLayerWmts(projection) {
   const options = await getWmtsOptions(projection);

   if (options === null) {
      return null;
   }

   return new TileLayer({
      source: new WMTS(options),
      maxZoom: baseMap.maxZoom   
   });
}

function createTileLayerWms() {
   return new TileLayer({
      source: new TileWMS({
         url: baseMap.wmsUrl,
         params: {
            LAYERS: baseMap.layer,
            VERSION: '1.1.1',
         }
      }),
      maxZoom: baseMap.maxZoom
   });
}

async function getWmtsOptions(epsgCode) {
   let response;

   try {
      response = await axios.get(baseMap.wmtsUrl, { timeout: 2000 });
   } catch {
      return null;
   }

   const capabilities = new WMTSCapabilities().read(response.data);

   return optionsFromCapabilities(capabilities, {
      layer: baseMap.layer,
      matrixSet: epsgCode
   });
}