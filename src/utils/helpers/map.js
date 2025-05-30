import { isNil } from "lodash";
import GeoJSON from "ol/format/GeoJSON";
import proj4 from "proj4";

export const DEFAULT_ZOOM = 15;

const EPSG_REGEX =
   /^(http:\/\/www\.opengis\.net\/def\/crs\/EPSG\/0\/|^urn:ogc:def:crs:EPSG::|^EPSG:)(?<epsg>\d+)$/m;

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

   return match !== null ? parseInt(match.groups.epsg) : 4326;
}

export function getLayer(map, id) {
   return (
      map
         .getLayers()
         .getArray()
         .find((layer) => layer.get("id") === id) || null
   );
}

export function getVectorSource(layer) {
   const source = layer.getSource();

   return source.get("id") === "cluster-source" ? source.getSource() : source;
}

export function hasFeatures(map, layerName = "features", withGeom = true) {
   const layer = getLayer(map, layerName);
   const source = getVectorSource(layer);

   if (withGeom) {
      return source
         .getFeatures()
         .some((feature) => feature.getGeometry() !== null);
   }

   return source.getFeatures().length > 0;
}

export function getFeatureById(
   map,
   id,
   featureType = "default",
   layerName = "features"
) {
   const layer = getLayer(map, layerName);
   const source = getVectorSource(layer);

   return (
      source
         .getFeatures()
         .find(
            (feature) =>
               feature.get("id")?.value === id &&
               feature.get("_featureType") === featureType
         ) || null
   );
}

export function getFeaturesById(map, ids, layerName = "features") {
   const layer = getLayer(map, layerName);
   const source = getVectorSource(layer);

   return source
      .getFeatures()
      .filter((feature) => ids.includes(feature.get("id")?.value));
}

export function getProperties(featureProperties) {
   const { geometry, ...properties } = featureProperties;
   const props = {};

   Object.entries(properties)
      .filter((entry) => !entry[0].startsWith("_"))
      .forEach((entry) => {
         props[entry[0]] = entry[1];
      });

   return props;
}

export function getPropertyValue(feature, propName) {
   return feature.get(propName)?.value;
}

export function hasValue(feature, propName) {
   return !isNil(propName);
}

export function zoomToGeoJsonFeature(map, geoJson, zoom) {
   const feature = new GeoJSON().readFeature(geoJson);
   const geometry = feature.getGeometry();

   zoomToGeometry(map, geometry, zoom);
}

export function zoomToFeature(map, feature, zoom, disableZoomOut) {
   const geometry = feature.getGeometry();

   zoomToGeometry(map, geometry, zoom, disableZoomOut);
}

export function zoomToGeometry(
   map,
   geometry,
   zoom = DEFAULT_ZOOM,
   disableZoomOut = false
) {
   const view = map.getView();
   const currentZoom = view.getZoom();

   view.fit(geometry, { padding: [50, 50, 50, 50] });
   view.setZoom(disableZoomOut ? currentZoom : zoom);
}

export function readGeoJsonFeature(feature) {
   if (feature === null) {
      return null;
   }

   return new GeoJSON().readFeature(feature);
}

export function readGeometry(geometry, srcEpsg, destEpsg, precision = 0) {
   if (geometry === null) {
      return null;
   }

   let options = {};

   if (srcEpsg && destEpsg) {
      options = {
         dataProjection: srcEpsg,
         featureProjection: destEpsg,
      };
   }

   if (precision > 0) {
      options.decimals = precision;
   }

   return new GeoJSON().readGeometry(geometry, options);
}

export function writeFeatureObject(feature, srcEpsg, destEpsg, precision = 0) {
   if (feature === null) {
      return null;
   }

   let options = {};

   if (srcEpsg && destEpsg) {
      options = {
         dataProjection: destEpsg,
         featureProjection: srcEpsg,
      };
   }

   if (precision > 0) {
      options.decimals = precision;
   }

   return new GeoJSON().writeFeatureObject(feature, options);
}

export function writeGeometryObject(
   geometry,
   srcEpsg,
   destEpsg,
   precision = 0
) {
   if (geometry === null) {
      return null;
   }

   let options = {};

   if (srcEpsg && destEpsg) {
      options = {
         dataProjection: destEpsg,
         featureProjection: srcEpsg,
      };
   }

   if (precision > 0) {
      options.decimals = precision;
   }

   return new GeoJSON().writeGeometryObject(geometry, options);
}

export function writeGeometry(geometry, srcEpsg, destEpsg, precision = 0) {
   const geometryObject = writeGeometryObject(
      geometry,
      srcEpsg,
      destEpsg,
      precision
   );

   return JSON.stringify(geometryObject);
}

export function transformCoordinates(srcEpsg, destEpsg, coordinates) {
   const srcProjection = proj4(srcEpsg);
   const destProjection = proj4(destEpsg);

   try {
      const transformed = proj4.transform(
         srcProjection.oProj,
         destProjection.oProj,
         coordinates
      );
      return [transformed.x, transformed.y];
   } catch (error) {
      console.error(error);
      return null;
   }
}

export function roundCoordinates(coordinates) {
   return coordinates.map(
      (coordinate) =>
         Math.round((coordinate + Number.EPSILON) * 1000000) / 1000000
   );
}

export function getInteraction(map, name) {
   return (
      map
         .getInteractions()
         .getArray()
         .find((interaction) => interaction.get("_name") === name) || null
   );
}

function getCrsName(geoJson) {
   return geoJson?.crs?.properties?.name;
}
