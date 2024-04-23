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
   const toUpdate = getPropsToUpdate(original, updated);

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

function getPropsToUpdate(original, updated) {
   let updatedProps;

   if (updated.get('id').value === null) {
      updatedProps = getProperties(updated.getProperties());
      updatedProps._coordinates = updated.get('_coordinates');

      return updatedProps;
   }

   let origProps = {};

   if (original !== null) {
      origProps = getProperties(original.getProperties());
      origProps._coordinates = original.get('_coordinates');
   }

   updatedProps = getProperties(updated.getProperties());
   updatedProps._coordinates = updated.get('_coordinates');

   return diff(origProps, updatedProps);
}