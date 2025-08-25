import { createEmpty, extend } from "ol/extent";
import {
   getLayer,
   getVectorSource,
   roundCoordinates,
   transformCoordinates,
   writeGeometryObject,
} from "utils/helpers/map";
import {
   selectFeature,
   setFeatureContextMenuData,
   setMapContextMenuData,
   setFeaturesInExtent,
} from "store/slices/mapSlice";
import { inPlaceSort } from "fast-sort";
import { reproject } from "reproject";
import { point as createPoint } from "@turf/helpers";
import getDistance from "@turf/distance";
import getCentroid from "@turf/centroid";
import store from "store";
import environment from "config/environment";
import { getAllFeatureLayers } from "./feature";

const CLUSTER_MAX_ZOOM = 14;
const MAP_PADDING = [50, 50, 50, 50];

export function toggleClusteredFeatures(map) {
   const mapZoom = map.getView().getZoom();
   const featureLayers = getAllFeatureLayers(map);

   featureLayers.forEach((layer) => {
      const isCluster = layer.get("_isCluster");

      if (mapZoom >= CLUSTER_MAX_ZOOM && isCluster) {
         toggleCluster(layer, false);
      } else if (mapZoom < CLUSTER_MAX_ZOOM && !isCluster) {
         toggleCluster(layer, true);
      }
   });
}

export function handleContextMenu(event, map) {
   event.preventDefault();

   if (isEditMode()) {
      return;
   }

   const features = map.getFeaturesAtPixel(event.pixel);

   if (features.length > 0) {
      return;
   }

   const coordinates = map.getCoordinateFromPixel(event.pixel);
   const lonLat = transformCoordinates(
      environment.MAP_EPSG,
      `EPSG:${environment.DATASET_SRID}`,
      coordinates
   );
   const roundedLonLat = roundCoordinates(lonLat);
   const originalEvent = event.originalEvent;

   store.dispatch(
      setMapContextMenuData({
         pixels: {
            x: originalEvent.clientX,
            y: originalEvent.clientY,
         },
         coordinates,
         lonLat: roundedLonLat,
      })
   );
}

export async function handleMapClick(event, map) {
   if (isEditMode()) {
      return;
   }

   map.forEachFeatureAtPixel(event.pixel, async (featureAtPixel) => {
      const features = featureAtPixel.get("features");

      const layer = getLayer(map, features[0].get("datasetId"));

      if (!layer?.get("_isCluster")) {
         handleNonClusteredFeatures(map, event);
         return;
      }

      if (features.length === 1) {
         const feature = features[0];

         store.dispatch(
            selectFeature({
               datasetId: feature.get("datasetId"),
               id: feature.get("id").value,
               zoom: true,
               disableZoomOut: true,
               featureType: feature.get("_featureType"),
            })
         );
      } else if (features.length > 1) {
         const extent = createEmpty();
         features.forEach((feature) =>
            extend(extent, feature.getGeometry().getExtent())
         );

         const view = map.getView();
         view.fit(extent, { duration: 500, padding: MAP_PADDING, maxZoom: 18 });
      }

      return true;
   });
}

export function setFeatureIdsInExtent(map) {
   if (!showObjectsInExtent()) {
      return;
   }

   const view = map.getView();
   const point = createPoint(view.getCenter());
   const centerPoint = reproject(
      point,
      environment.MAP_EPSG,
      `EPSG:${environment.DATASET_SRID}`
   );
   const extent = view.calculateExtent(map.getSize());
   const layer = getLayer(map, "features");
   const source = getVectorSource(layer);
   const features = [];

   source.forEachFeatureInExtent(extent, (feature) => {
      const geometry = writeGeometryObject(
         feature.getGeometry(),
         "EPSG:3857",
         "EPSG:4326"
      );
      const centroid = getCentroid(geometry);
      const distance = getDistance(centerPoint, centroid, { units: "meters" });

      features.push({
         id: feature.get("id").value,
         distance,
      });
   });

   inPlaceSort(features).by({ asc: (feature) => feature.distance });
   const featureIds = features.map((feature) => feature.id);

   store.dispatch(setFeaturesInExtent(featureIds));
}

function handleNonClusteredFeatures(map, event) {
   const features = map.getFeaturesAtPixel(event.pixel, { hitTolerance: 10 });

   if (features.length === 1) {
      store.dispatch(
         selectFeature({
            datasetId: features[0].get("datasetId"),
            id: features[0].get("id").value,
            zoom: true,
            disableZoomOut: true,
            featureType: features[0].get("_featureType"),
         })
      );
   } else if (features.length > 1) {
      const originalEvent = event.originalEvent;
      const featureIds = features.map((feature) => feature.get("id").value);

      store.dispatch(
         setFeatureContextMenuData({
            pixels: {
               x: originalEvent.clientX,
               y: originalEvent.clientY,
            },
            featureIds,
         })
      );
   }
}

function toggleCluster(layer, toggle) {
   const disabledSource = layer.get("_disabledSource");
   const currentSource = layer.getSource();

   layer.set("_isCluster", toggle);
   layer.setSource(disabledSource);
   layer.set("_disabledSource", currentSource);
}

function isEditMode() {
   return store.getState().map.editMode;
}

function showObjectsInExtent() {
   return store.getState().object.showObjectsInExtent;
}
