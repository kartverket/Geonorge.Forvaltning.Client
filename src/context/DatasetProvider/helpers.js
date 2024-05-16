import { isNil, orderBy } from 'lodash';

export function getAllowedValuesForUser(columnName, metadata, user, ownerOrganization) {   
   if (user === null) {
      return [];
   }

   const column = metadata
      .find(data => data.ColumnName === columnName);

   if (column.AllowedValues === null) {
      return null;
   }

   if (column.AccessByProperties.length === 0 || user.organization === ownerOrganization) {
      return column.AllowedValues;
   }

   const values = column.AccessByProperties
      .filter(access => access.Contributors
         .some(orgNo => orgNo === user.organization))
      .map(access => access.Value)

   return orderBy(values, value => value.toLowerCase());
}

export function createFeatureCollectionGeoJson(dataset) {
   const metadata = dataset.definition.ForvaltningsObjektPropertiesMetadata;
   const features = dataset.objects.map(object => createFeatureGeoJson(metadata, object));

   return {
      type: 'FeatureCollection',
      features
   };
}

export function createFeatureGeoJson(metadata, object = {}) {
   const feature = {
      type: 'Feature',
      geometry: object.geometry || null,
      tag: object.tag || null,
      properties: {
         id: {
            name: 'ID',
            value: object.id || null,
            dataType: null
         }
      }
   };

   metadata.forEach(data => {
      feature.properties[data.ColumnName] = {
         name: data.Name,
         value: !isNil(object[data.ColumnName]) ? object[data.ColumnName] : null,
         dataType: data.DataType
      }
   });

   return feature;
}
