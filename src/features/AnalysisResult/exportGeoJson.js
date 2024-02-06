import { camelCase } from 'lodash';
import { point as createPoint, featureCollection as createFeatureCollection } from '@turf/helpers';
import { inPlaceSort } from 'fast-sort';
import { saveAs } from 'file-saver';
import { getFeatureById, getProperties } from 'utils/helpers/map';
import dayjs from 'dayjs';

export function toGeoJson(map, analysisResult) {
   const start = createStart(map, analysisResult);
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

function createStart(map, featureCollection) {
   
   const feature = getFeatureById(map, featureId);
   const { id, ...restProperties } = getProperties(feature);
   const newProperties = mapProperties(restProperties, 'start');
   const start = createPoint(feature.get('_coordinates'), newProperties, { id: id.value });

   return start;
}

function createDestinations(featureCollection) {
   const destinations = featureCollection.features
      .filter(feature => feature.geometry?.type === 'Point')
      .map(feature => {
         const { properties, geometry, ...restFeature } = feature;
         const { id, ...restProperties } = feature.properties;
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
      .filter(feature => feature.geometry?.type !== 'Point')
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