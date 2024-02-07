import { camelCase } from 'lodash';
import { featureCollection as createFeatureCollection } from '@turf/helpers';
import { inPlaceSort } from 'fast-sort';
import { saveAs } from 'file-saver';
import { getProperties } from 'utils/helpers/map';
import dayjs from 'dayjs';

export function toGeoJson(analysisResult) {
   const start = createStart(analysisResult);
   const destinations = createDestinations(analysisResult)
   const routes = createRoutes(analysisResult);

   inPlaceSort(destinations).by({
      asc: destination => {
         const route = routes.find(route => route.properties.destinationId === destination.id);
         return route?.properties.distance || Number.MAX_VALUE
      }
   });

   inPlaceSort(routes).by({
      asc: route => route.properties.distance || Number.MAX_VALUE
   });

   const featureCollection = createFeatureCollection([start, ...destinations, ...routes]);
   const geoJson = JSON.stringify(featureCollection, null, 3);

   const blob = new Blob([geoJson], { type: 'application/geo+json;charset=utf-8' });
   const timestamp = dayjs().format('YYYYMMDDHHmmss');
   const fileName = `analyseresultat-${timestamp}.geojson`;

   saveAs(blob, fileName);
}

function createStart(featureCollection) {
   const start = featureCollection.features.find(feature => feature.properties._type === 'start');
   const { id, ...restProperties } = getProperties(start.properties);
   const newProperties = mapProperties(restProperties, 'start');
   
   return {
      type: 'Feature',
      id: id.value,
      properties: newProperties,
      geometry: start.geometry
   };
}

function createDestinations(featureCollection) {
   const destinations = featureCollection.features
      .filter(feature => feature.properties._type === 'destination')
      .map(feature => {
         const { properties, geometry, ...restFeature } = feature;
         const { id, ...restProperties } = getProperties(properties);
         const newProperties = mapProperties(restProperties, 'destination');

         restFeature.id = id.value;
         restFeature.properties = newProperties;
         restFeature.geometry = geometry

         return restFeature;
      });

   return destinations;
}

function createRoutes(featureCollection) {
   const routes = featureCollection.features
      .filter(feature => feature.properties._type === 'route')
      .map(feature => {
         const { properties, geometry, ...restFeature } = feature;
         const newProperties = { ...feature.properties };

         newProperties._type = 'route';
         restFeature.properties = newProperties;
         restFeature.geometry = geometry;

         return restFeature;
      });

   return routes;
}

function mapProperties(properties, type) {
   const newProperties = {};

   Object.values(properties)
      .map(value => [camelCase(value.name), value.value])
      .forEach(property => {
         newProperties[property[0]] = property[1];
      });

   newProperties._type = type;

   return newProperties;
}