import { reproject } from 'reproject';
import { inPlaceSort } from 'fast-sort';
import getCentroid from '@turf/centroid';
import environment from 'config/environment';

export function getSearchResult(response, objects, query) {
    const objectFeatures = getObjectFeatures(objects, query);
    const result = response.data.features.concat(objectFeatures);

    inPlaceSort(result).asc(feature => feature.properties.name);

    return result;
}

function getObjectFeatures(objects, query) {
    return objects
        .filter(object => {
            return typeof object['c_1'] === 'string' ?
                object['c_1'].toLowerCase().startsWith(query) && object.geometry !== null :
                false;
        })
        .map(object => {
            let geometry = object.geometry;

            if (geometry.type !== 'Point') {
                const centroid = getCentroid(geometry);
                geometry = centroid.geometry;
            }

            return {
                type: 'Feature',
                id: object.id,
                geometry: reproject(geometry, `EPSG:${environment.DATASET_SRID}`, environment.MAP_EPSG),
                properties: {
                    'name': object['c_1'],
                    'objectType': 'Forvaltningsobjekt',
                    'municipality': null,
                    'county': null
                }
            };
        });
}
