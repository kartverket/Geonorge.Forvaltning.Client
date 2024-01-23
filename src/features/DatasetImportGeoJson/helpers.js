import { isNil } from 'lodash';
import { reproject } from 'reproject';
import gjv from 'geojson-validation';
import dayjs from 'dayjs';
import environment from 'config/environment';
import { roundCoordinates } from 'utils/helpers/map';

export function mapGeoJsonToObjects(geoJson, mappings, importSrId, user) {
   const ownerOrg = user.organization;
   const editor = user.email;
   const updateDate = dayjs().format();

   return geoJson.features
      .map(feature => {
         const geometry = getGeometry(feature.geometry, importSrId);

         if (geometry === null) {
            return null;
         }

         const { properties } = feature;

         const object = {
            geometry: JSON.stringify(geometry),
            'owner_org': ownerOrg,
            editor: editor,
            updatedate: updateDate
         };

         Object.entries(mappings).forEach(entry => {
            const prop = properties[entry[1]];
            object[entry[0]] = getPropValue(prop);
         });

         return object;
      })
      .filter(feature => feature !== null);
}

function getGeometry(geometry, importSrId) {
   if (!gjv.isPoint(geometry)) {
      return null;
   }

   const transformed = importSrId !== environment.DATASET_SRID ?
      reproject(geometry, `EPSG:${importSrId}`, `EPSG:${environment.DATASET_SRID}`) :
      geometry;

   transformed.coordinates = roundCoordinates(transformed.coordinates);

   return transformed;
}

function getPropValue(prop) {
   if (isNil(prop) || prop.toString().toLowerCase() === 'null') {
      return null;
   }

   return prop;
}