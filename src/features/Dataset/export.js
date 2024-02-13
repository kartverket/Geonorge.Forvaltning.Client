import { inPlaceSort } from 'fast-sort';
import { camelCase, isNil, kebabCase } from 'lodash';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

export function toGeoJson(dataset) {
   const metadata = dataset.definition.ForvaltningsObjektPropertiesMetadata;
   const features = dataset.objects.map(object => createFeatureGeoJson(metadata, object));

   inPlaceSort(features).asc(feature => feature.id);
   
   const featureCollection = {
      type: 'FeatureCollection',
      features
   };
   
   const geoJson = JSON.stringify(featureCollection, null, 3);
   const blob = new Blob([geoJson], { type: 'application/geo+json;charset=utf-8' });

   const datasetName = kebabCase(dataset.definition.Name);
   const timestamp = dayjs().format('YYYYMMDDHHmmss');
   const fileName = `eksport-${datasetName}-${timestamp}.geojson`;

   saveAs(blob, fileName);
}

export function createFeatureGeoJson(metadata, object) {
   const feature = {
      type: 'Feature',
      id: object.id,
      properties: {}
   };

   metadata.forEach(data => {
      const propName = camelCase(data.Name);
      const propValue = !isNil(object[data.ColumnName]) ? object[data.ColumnName] : null;

      feature.properties[propName] = typeof propValue === 'string' ? propValue.trim() : propValue;
   });

   feature.geometry = object.geometry || null;

   return feature;
}