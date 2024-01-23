import { diff } from 'deep-object-diff';
import { getFeatureById, getProperties, readGeoJson } from 'utils/helpers/map';
import { reproject } from 'reproject';
import { point as createPoint } from '@turf/helpers';
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
      origProps._coordinates = original.get('_coordinates');
   }

   const updatedProps = getProperties(updated);
   updatedProps._coordinates = updated.get('_coordinates');

   const toUpdate = diff(origProps, updatedProps)

   if (Object.keys(toUpdate).length === 0) {
      return null;
   }

   if ('_coordinates' in toUpdate) {
      const feature = createPoint(updated.get('_coordinates'));
      toUpdate.geometry = { value: JSON.stringify(feature.geometry) };
      delete toUpdate._coordinates;
   }

   const payload = {};

   Object.entries(toUpdate)
      .forEach(entry => payload[entry[0]] = entry[1].value);

   if (payload.id === null) {
      delete payload.id;
   }

   return payload;
}
