import { renderProperty } from "utils/helpers/general";
import { inPlaceSort } from "fast-sort";

export function mapAnalysisResult(featureCollection) {
   const objects = featureCollection.features.filter(
      (feature) => feature.properties._type === "destination"
   );

   const routes = featureCollection.features.filter(
      (feature) => feature.properties._type === "route"
   );

   const resultList = objects.map((object) => {
      const properties = Object.values(object.properties)
         .slice(0, 3)
         .map((value) => [value.name, renderProperty(value)]);

      const route = routes.find(
         (route) =>
            route.properties.destinationId === object.properties.id.value
      );

      return {
         id: object.properties.id.value,
         properties,
         route: {
            distance: route.properties.distance || null,
            duration: route.properties.duration || null,
            statusCode: route.properties.statusCode || null,
         },
         hasRoute: route.properties.distance !== undefined,
      };
   });

   inPlaceSort(resultList).by({
      asc: (result) => result.route.distance || Number.MAX_VALUE,
   });

   const start = featureCollection.features.find(
      (feature) => feature.properties._type === "start"
   );

   const properties = Object.values(start.properties)
      .slice(0, 3)
      .map((value) => [value.name, renderProperty(value)]);

   return {
      start: {
         id: start.properties.id.value,
         properties,
      },
      resultList,
   };
}
