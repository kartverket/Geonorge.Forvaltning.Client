import { getFeatureById, getProperties, readGeometry, writeGeometry } from 'utils/helpers/map';
import { reproject } from 'reproject';
import WKT from 'ol/format/WKT';
import environment from 'config/environment';

const DATASET_EPSG = `EPSG:${environment.DATASET_SRID}`;

export function updateFeature({ id, properties }, map) {
   const feature = getFeatureById(map, id);

   if (feature === null) {
      return null;
   }

   const featureKeys = Object.keys(feature.getProperties());

   Object.entries(properties)
      .filter(entry => featureKeys.includes(entry[0]))
      .forEach(entry => {
         if (entry[0] === 'geometry') {
            let geometry = entry[1];
            try {
               geometry = JSON.parse(entry[1]);
            } catch (e) { console.error("Error parse geometry: ", e); }
               const transformed = reproject(geometry, DATASET_EPSG, environment.MAP_EPSG);
   
               feature.setGeometry(readGeometry(transformed));
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

   if ('_geometry' in toUpdate) {
      const geometry = writeGeometry(updated.getGeometry(), 'EPSG:3857', 'EPSG:4326', 6);
      toUpdate.geometry = { value: geometry };
      delete toUpdate._geometry;
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
   const format = new WKT();

   if (updated.get('id').value === null) {
      updatedProps = getProperties(updated.getProperties());
      updatedProps._geometry = format.writeGeometry(updated.getGeometry());

      return updatedProps;
   }

   let origProps = {};

   if (original !== null) {
      origProps = getProperties(original.getProperties());
      origProps._geometry = format.writeGeometry(original.getGeometry());
   }

   updatedProps = getProperties(updated.getProperties());
   updatedProps._geometry = format.writeGeometry(updated.getGeometry());

   return updatedProps;
}