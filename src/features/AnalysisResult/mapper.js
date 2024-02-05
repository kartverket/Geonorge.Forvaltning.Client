import { renderProperty } from 'utils/helpers/general';
import { getFeatureById, getProperties } from 'utils/helpers/map';
import { inPlaceSort } from 'fast-sort';

export function mapAnalysisResult(map, analysisResult) {
   const objects = analysisResult.featureCollection.features
      .filter(feature => feature.geometry?.type === 'Point');

   const routes = analysisResult.featureCollection.features
      .filter(feature => feature.geometry?.type !== 'Point');

   const resultList = objects.map(object => {
      const properties = Object.values(object.properties).slice(0, 3)
         .map(value => [value.name, renderProperty(value)]);

      const route = routes
         .find(route => route.properties.destinationId === object.properties.id.value);

      return {
         id: object.properties.id.value,
         properties,
         route: {
            distance: route.properties.distance || null,
            duration: route.properties.duration || null,
            statusCode: route.properties.statusCode || null
         },
         hasRoute: route.properties.distance !== undefined
      };
   });

   inPlaceSort(resultList).by({
      asc: result => result.route.distance || Number.MAX_VALUE
   });

   const feature = getFeatureById(map, analysisResult.featureId);
   const props = getProperties(feature);

   const properties = Object.values(props).slice(0, 3)
      .map(value => [value.name, renderProperty(value)]);

   return {
      start: {
         id: analysisResult.featureId,
         properties
      },
      resultList
   };
}