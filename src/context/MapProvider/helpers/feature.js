import { Cluster, Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { GeoJSON } from "ol/format";
import { Point } from "ol/geom";
import { GeometryType } from "./constants";
import {
   getEpsgCode,
   getFeatures,
   getLayer,
   getVectorSource,
   writeGeometryObject,
} from "utils/helpers/map";
import { clusterStyle, featureStyle } from "./style";
import getCentroid from "@turf/centroid";
import environment from "config/environment";
import { getLayerClusterSourceId, getLayerFeaturesId } from "./utils";

export function createFeaturesLayer(datasetId, featureCollection) {
   const vectorSource = new VectorSource();
   const format = new GeoJSON();
   const epsgCode = getEpsgCode(featureCollection);

   const features = featureCollection.features.map((feature) =>
      createFeature(feature, epsgCode, format)
   );

   vectorSource.addFeatures(features);

   const clusterSource = new Cluster({
      source: vectorSource,
      distance: 35,
      geometryFunction: (feature) => {
         const geometry = feature.getGeometry();

         if (geometry === null) {
            return null;
         }

         const geometryType = geometry.getType();

         if (geometryType === GeometryType.Point) {
            return geometry;
         }

         const geometryObject = writeGeometryObject(feature.getGeometry());
         const centroid = getCentroid(geometryObject);

         return new Point(centroid.geometry.coordinates);
      },
   });

   clusterSource.set("id", getLayerClusterSourceId(datasetId));

   const vectorLayer = new VectorLayer({
      source: clusterSource,
      style: clusterStyle,
   });

   vectorLayer.set("id", getLayerFeaturesId(datasetId));
   vectorLayer.set("_isCluster", true);
   vectorLayer.set("_disabledSource", vectorSource);

   return vectorLayer;
}

export function createFeaturesEditLayer() {
   const vectorSource = new VectorSource();

   const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: featureStyle,
   });

   vectorLayer.set("id", "features-edit");

   return vectorLayer;
}

export function createRoutesFeaturesLayer() {
   const vectorLayer = new VectorLayer({
      source: new VectorSource(),
   });

   vectorLayer.set("id", "routes");

   return vectorLayer;
}

export function createFeature(
   geoJson,
   epsgCode = null,
   format = new GeoJSON()
) {
   let options =
      epsgCode !== null
         ? { dataProjection: epsgCode, featureProjection: environment.MAP_EPSG }
         : {};
   const feature = format.readFeature(geoJson, options);

   feature.setStyle(featureStyle);
   feature.set("_visible", true);
   feature.set("_tag", geoJson.properties._tag);
   feature.set("_featureType", "default");

   if (
      !geoJson.properties._coordinates &&
      geoJson.geometry?.type === GeometryType.Point
   ) {
      feature.set("_coordinates", geoJson.geometry?.coordinates);
   }

   return feature;
}

export function addFeatureToMap(map, feature) {
   const vectorLayer = getLayer(map, feature.get("datasetId"));
   const vectorSource = getVectorSource(vectorLayer);

   vectorSource.addFeature(feature);
}

export function removeFeatureFromMap(map, feature) {
   const vectorLayer = getLayer(map, feature.get("datasetId"));
   const vectorSource = getVectorSource(vectorLayer);

   vectorSource.removeFeature(feature);
}

export function toggleFeature(feature) {
   feature.set("_visible", !feature.get("_visible"));
}

export function highlightFeature(map, datasetId, previousDatasetId, feature) {
   const previousVectorLayer = getLayer(map, previousDatasetId);
   if (previousVectorLayer) {
      const previousSelectedFeature =
         previousVectorLayer.get("_selectedFeature");
      if (previousSelectedFeature) {
         previousSelectedFeature.set("_selected", false);
      }
   }

   if (feature !== null) {
      const vectorLayer = getLayer(map, datasetId);
      feature.set("_selected", true);
      vectorLayer.set("_selectedFeature", feature);
   }
}

export function setNextAndPreviousFeatureId(map, activeDatasetId, feature) {
   const features = getFeatures(map, activeDatasetId);

   if (features.length <= 1) {
      feature.set("_nextFeature", null);
      feature.set("_prevFeature", null);
   }

   const featureIds = features.map((feature) => feature.get("id").value).sort();

   const thisId = feature.get("id").value;
   const index = featureIds.indexOf(thisId);
   let prevIndex, nextIndex;

   if (index === 0) {
      prevIndex = featureIds.length - 1;
      nextIndex = index + 1;
   } else if (index === featureIds.length - 1) {
      prevIndex = index - 1;
      nextIndex = 0;
   } else {
      prevIndex = index - 1;
      nextIndex = index + 1;
   }

   feature.set("_nextFeature", featureIds[nextIndex]);
   feature.set("_prevFeature", featureIds[prevIndex]);
}
