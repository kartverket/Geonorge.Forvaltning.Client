import { Map, View } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer';
import { Style, Stroke } from 'ol/style';
import { createPointFeatureStyle } from 'context/MapProvider/helpers/style';
import { createTileLayer } from 'context/MapProvider/helpers/tileLayer';

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 600;
const TIMEOUT_MS = 5000;

export async function createMapImages(featureCollection) {
   const start = featureCollection.features.find(feature => feature.properties._type === 'start');
   const destinations = featureCollection.features.filter(feature => feature.properties._type === 'destination');
   const routes = featureCollection.features.filter(feature => feature.geometry.type === 'LineString');
   const promises = [];

   for (let i = 0; i < destinations.length; i++) {
      const destination = destinations[i];
      const route = routes.find(route => route.properties.destinationId === destination.properties.id.value);

      promises.push(createMapImage(start, destination, route));
   }

   return await Promise.allSettled(promises);
}

async function createMapImage(start, destination, route) {
   const [map, mapElement] = await createTempMap(start, destination, route);

   return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
         reject(null);
      }, TIMEOUT_MS);

      map.once('rendercomplete', () => {
         clearTimeout(timeout);

         const base64 = exportToPngImage(map);
         map.dispose();
         mapElement.remove();

         resolve({ destinationId: route.properties.destinationId, image: base64 });
      });
   });
}

async function createTempMap(start, destination, route) {
   const featuresLayer = createFeaturesLayer(start, destination, route);
   const tileLayer = await createTileLayer();

   const map = new Map({
      layers: [
         tileLayer,
         featuresLayer
      ]
   });

   map.setView(new View({
      padding: [50, 50, 50, 50],
      projection: 'EPSG:3857'
   }));

   const mapElement = document.createElement('div');
   Object.assign(mapElement.style, { position: 'absolute', top: '-9999px', left: '-9999px', width: `${IMAGE_WIDTH}px`, height: `${IMAGE_HEIGHT}px` });
   document.getElementsByTagName('body')[0].appendChild(mapElement);

   map.setTarget(mapElement);

   const extent = featuresLayer.getSource().getExtent();
   map.getView().fit(extent, map.getSize());

   return [map, mapElement];
}

function createFeaturesLayer(start, destination, route) {
   const reader = new GeoJSON();
   const source = new VectorSource();

   const startFeature = reader.readFeature(start, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
   startFeature.setStyle(createPointFeatureStyle({ color1: '#3767c7', color2: '#3767c75e' }));

   const destFeature = reader.readFeature(destination, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
   destFeature.setStyle(createPointFeatureStyle({ color1: '#249446', color2: '#2494465e' }));

   const routeFeature = reader.readFeature(route, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
   routeFeature.setStyle(createRouteStyle());

   source.addFeatures([startFeature, destFeature, routeFeature]);

   return new VectorLayer({ source });
}

function exportToPngImage(map) {
   const mapCanvas = document.createElement('canvas');
   const size = map.getSize();

   mapCanvas.width = size[0];
   mapCanvas.height = size[1];
   const mapContext = mapCanvas.getContext('2d');
   const canvases = map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer');

   canvases.forEach(canvas => {
      if (canvas.width === 0) {
         return;
      }

      const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
      mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
      const transform = canvas.style.transform;
      let matrix;

      if (transform) {
         matrix = transform
            .match(/^matrix\(([^(]*)\)$/)[1]
            .split(',')
            .map(Number);
      } else {
         matrix = [parseFloat(canvas.style.width) / canvas.width, 0, 0, parseFloat(canvas.style.height) / canvas.height, 0, 0];
      }

      CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
      const backgroundColor = canvas.parentNode.style.backgroundColor;

      if (backgroundColor) {
         mapContext.fillStyle = backgroundColor;
         mapContext.fillRect(0, 0, canvas.width, canvas.height);
      }

      mapContext.drawImage(canvas, 0, 0);
   });

   mapContext.globalAlpha = 1;
   mapContext.setTransform(1, 0, 0, 1, 0, 0);

   return mapCanvas.toDataURL();
}

function createRouteStyle() {
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
