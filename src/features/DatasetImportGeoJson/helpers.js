import { isUndefined } from 'lodash';
import gjv from 'geojson-validation';
import proj4 from 'proj4';
import dayjs from 'dayjs';

export function mapGeoJsonToObjects(featureCollection, mappings, importSrId, datasetSrId, user) {
   const ownerOrg = user.organization;
   const editor = user.email;
   const updateDate = dayjs().format();
   let srcProjection, destProjection;

   if (importSrId !== datasetSrId) {
      srcProjection = proj4(`EPSG:${importSrId}`);
      destProjection = proj4(`EPSG:${datasetSrId}`);
   }

   return featureCollection.features
      .map(feature => {
         const { geometry, properties } = feature;

         if (!gjv.isPoint(geometry)) {
            return null;
         }

         if (importSrId !== datasetSrId) {
            const transformed  = transformCoordinates(srcProjection, destProjection, geometry.coordinates);

            if (transformed === null) {
               return null;
            }

            geometry.coordinates = [transformed.x, transformed.y];
         }

         const object = {
            geometry: JSON.stringify(geometry),
            'owner_org': ownerOrg,
            editor: editor,
            updatedate: updateDate
         };

         Object.entries(mappings).forEach(entry => {
            const prop = properties[entry[1]];
            object[entry[0]] = !isUndefined(prop) ? prop : null;
         });

         return object;
      })
      .filter(feature => feature !== null);
}

function transformCoordinates(srcProjection, destProjection, coordinates) {
   try {
      return proj4.transform(srcProjection.oProj, destProjection.oProj, coordinates)
   } catch {
      return null;  
   }
}