export function getLayerClusterSourceId(datasetId) {
   return getLayerId(datasetId, "cluster-source");
}

export function getLayerFeaturesId(datasetId) {
   return getLayerId(datasetId, "features");
}

function getLayerId(datasetId, layerType) {
   return `${datasetId}-${layerType}`;
}
