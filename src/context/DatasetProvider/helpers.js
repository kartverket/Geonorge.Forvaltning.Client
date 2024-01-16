import { isNil, orderBy } from 'lodash';

export function getAllowedValuesForUser(columnName, metadata, user) {   
   if (user === null) {
      return [];
   }

   const column = metadata
      .find(data => data.ColumnName === columnName);

   if (column.AllowedValues === null) {
      return null;
   }

   if (column.AccessByProperties.length === 0) {
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
   const srid = dataset.definition.srid;
   const features = dataset.objects.map(object => createFeatureGeoJson(metadata, object));

   return {
      type: 'FeatureCollection',
      crs: {
         type: 'name',
         properties: {
            name: `urn:ogc:def:crs:EPSG::${srid || 4326}`
         }
      },
      features
   };
}

export function createFeatureGeoJson(metadata, object = {}) {
   const feature = {
      type: 'Feature',
      geometry: object.geometry || null,
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
