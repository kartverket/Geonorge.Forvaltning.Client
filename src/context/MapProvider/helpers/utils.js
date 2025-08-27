import { isEmpty } from "ol/extent";

export function getLayerClusterSourceId(datasetId) {
   return getLayerId(datasetId, "cluster-source");
}

export function getLayerFeaturesId(datasetId) {
   return getLayerId(datasetId, "features");
}

function getLayerId(datasetId, layerType) {
   return `${datasetId}-${layerType}`;
}

function getVectorSource(layer) {
   const source = layer && layer.getSource && layer.getSource();
   return source && typeof source.getSource === "function"
      ? source.getSource()
      : source;
}

function fitMapToExtent(
   map,
   extent,
   { padding = [50, 50, 50, 50], maxZoom = 18, duration = 500 } = {}
) {
   map.updateSize();

   requestAnimationFrame(() => {
      map.getView().fit(extent, {
         padding,
         maxZoom,
         duration,
         constrainResolution: true,
         nearest: true,
      });
   });
}
export function fitLayerExtentWhenReady(map, layer, opts) {
   const source = getVectorSource(layer);
   if (!source) return;

   const tryFit = () => {
      const extent = source.getExtent && source.getExtent();

      if (!isEmpty(extent)) {
         fitMapToExtent(map, extent, opts);
         return true;
      }

      return false;
   };

   if (source.getFeatures && source.getFeatures().length > 0 && tryFit())
      return;

   const onAdd = () => {
      if (tryFit()) cleanup();
   };

   const onEnd = () => {
      if (tryFit()) cleanup();
   };

   const onErr = () => cleanup();

   function cleanup() {
      source.un && source.un("addfeature", onAdd);
      source.un && source.un("featuresloadend", onEnd);
      source.un && source.un("featuresloaderror", onErr);
   }

   source.on && source.on("addfeature", onAdd);
   source.on && source.on("featuresloadend", onEnd);
   source.on && source.on("featuresloaderror", onErr);

   map.render && map.render();
}
