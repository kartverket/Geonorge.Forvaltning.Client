import { diff } from 'deep-object-diff';
import { getFeatureById, getProperties, readGeoJson, writeGeoJson } from 'utils/helpers/map';
import { reproject } from 'reproject';
import environment from 'config/environment';

const DATASET_EPSG = `EPSG:${environment.DATASET_SRID}`;

export function updateFeature({ id, properties }, map) {
   const feature = getFeatureById(map, id);

   if (!feature) {
      return null;
   }

   const featureKeys = Object.keys(feature.getProperties());

   Object.entries(properties)
      .filter(entry => featureKeys.includes(entry[0]))
      .forEach(entry => {
         if (entry[0] === 'geometry') {
            const geometry = JSON.parse(entry[1]);
            const transformed = reproject(geometry, DATASET_EPSG, environment.MAP_EPSG);

            feature.setGeometry(readGeoJson(transformed));
            feature.set('_coordinates', geometry.coordinates);
         } else {
            const prop = feature.get(entry[0]);

            feature.set(entry[0], {
               ...prop,
               value: entry[1]
            });
         }
      });

   return feature;
}

export function toDbModel(original, updated) {
   let origProps = {};

   if (original !== null) {
      origProps = getProperties(original);
      origProps.geometry = { value: writeGeoJson(original.getGeometry(), environment.MAP_EPSG, DATASET_EPSG) };
   }

   const updatedProps = getProperties(updated);
   updatedProps.geometry = { value: writeGeoJson(updated.getGeometry(), environment.MAP_EPSG, DATASET_EPSG) };

   const toUpdate = diff(origProps, updatedProps)

   if (Object.keys(toUpdate).length === 0) {
      return null;
   }

   const payload = {};

   Object.entries(toUpdate)
      .forEach(entry => payload[entry[0]] = entry[1].value);

   if (payload.id === null) {
      delete payload.id;
   }

   return payload;
}
