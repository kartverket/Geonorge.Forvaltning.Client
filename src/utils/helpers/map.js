import GeoJSON from 'ol/format/GeoJSON';
import { getFeatureStyle } from 'utils/map/style';
import proj4 from 'proj4';

const EPSG_REGEX = /^(http:\/\/www\.opengis\.net\/def\/crs\/EPSG\/0\/|^urn:ogc:def:crs:EPSG::|^EPSG:)(?<epsg>\d+)$/m;

export function getEpsgCode(geoJson) {
   const srId = getSrId(geoJson);

   return `EPSG:${srId}`;
}

export function getSrId(geoJson) {
   const crsName = getCrsName(geoJson);

   if (!crsName) {
      return 4326;
   }

   const match = EPSG_REGEX.exec(crsName);

   return match !== null ?
      parseInt(match.groups.epsg) :
      4326;
}

export function getLayer(map, id) {
   return map.getLayers().getArray()
      .find(layer => layer.get('id') === id);
}

export function getVectorSource(layer) {
   const source = layer.getSource();

   return source.get('id') === 'cluster-source' ?
      source.getSource() :
      source;
}

export function hasFeatures(map, layerName = 'features', withGeom = true) {
   const layer = getLayer(map, layerName);
   const source = getVectorSource(layer);

   if (withGeom) {
      return source.getFeatures().some(feature => feature.getGeometry() !== null);
   }
   
   return source.getFeatures().length > 0;
}

export function getFeatureById(map, id, layerName = 'features') {
   const layer = getLayer(map, layerName);
   const source = getVectorSource(layer);

   return source.getFeatures()
      .find(feature => feature.get('id')?.value === id);
}

export function getProperties(feature) {
   const { geometry, ...properties } = feature.getProperties();
   const props = {};

   Object.entries(properties)
      .filter(entry => !entry[0].startsWith('_'))
      .forEach(entry => {
         props[entry[0]] = entry[1];
      });

   return props;
}

export function getPropertyValue(feature, propName) {
   return feature.get(propName)?.value;
}

export function zoomToGeoJsonFeature(map, geoJson) {
   const feature = new GeoJSON().readFeature(geoJson)
   const geometry = feature.getGeometry();

   zoomToGeometry(map, geometry);
}

export function zoomToFeature(map, feature) {
   const geometry = feature.getGeometry();

   zoomToGeometry(map, geometry);
}

export function zoomToGeometry(map, geometry) {
   const view = map.getView();
   view.fit(geometry, { padding: [50, 50, 50, 50] });
   view.setZoom(15);
}

export function cloneFeature(feature) {
   const geoJson = writeGeoJsonFeature(feature);
   const clone = readGeoJsonFeature(geoJson);
   clone.setStyle(getFeatureStyle(7, 8));

   return clone;
}

export function readGeoJsonFeature(feature) {
   if (feature === null) {
      return null;
   }

   return new GeoJSON().readFeature(feature);
}

export function readGeoJson(geometry) {
   if (geometry === null) {
      return null;
   }

   return new GeoJSON().readGeometry(geometry);
}

export function writeGeoJsonFeature(feature) {
   if (feature === null) {
      return null;
   }

   return new GeoJSON().writeFeatureObject(feature);
}

export function writeGeoJson(geometry) {
   if (geometry === null) {
      return null;
   }

   return new GeoJSON().writeGeometry(geometry);
}

export function transformCoordinates(srcEpsg, destEpsg, coordinates) {
   const srcProjection = proj4(srcEpsg);
   const destProjection = proj4(destEpsg);

   try {
      const transformed = proj4.transform(srcProjection.oProj, destProjection.oProj, coordinates);
      return [transformed.x, transformed.y];
   } catch (error) {
      console.error(error);
      return null;  
   }
}

function getCrsName(geoJson) {
   return geoJson?.crs?.properties?.name;
}

