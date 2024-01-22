import { isNil } from 'lodash';
import { reproject } from 'reproject';
import gjv from 'geojson-validation';
import dayjs from 'dayjs';
import environment from 'config/environment';

export function mapGeoJsonToObjects(geoJson, mappings, importSrId, user) {
   const ownerOrg = user.organization;
   const editor = user.email;
   const updateDate = dayjs().format();

   const featureCollection = importSrId !== environment.DATASET_SRID ?
      reproject(geoJson, `EPSG:${importSrId}`, `EPSG:${environment.DATASET_SRID}`) :
      geoJson;

   return featureCollection.features
      .map(feature => {
         const { geometry, properties } = feature;

         if (!gjv.isPoint(geometry)) {
            return null;
         }

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

function getPropValue(prop) {   
   if (isNil(prop) || prop.toString().toLowerCase() === 'null') {
      return null;
   }

   return prop;
}