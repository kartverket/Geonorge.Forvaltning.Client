import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useDataset } from 'context/DatasetProvider';
import { addInteractions } from 'features/Map/Editor/helpers';
import createMap from './helpers/map';
import { useSelector } from 'react-redux';
import { addFeatureToMap, createFeature } from './helpers/feature';
import { createFeatureGeoJson } from 'context/DatasetProvider/helpers';
import environment from 'config/environment';

export default function MapProvider({ children }) {
    const { featureCollection, metadata } = useDataset();
    const [map, setMap] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const initRef = useRef(true);
    const createdDataObjectRemote = useSelector(state => state.object.createdDataObjectRemote);

    useEffect(
        () => {
            if (map === null || createdDataObjectRemote === null) {
                return;
            }

            const geoJson = createFeatureGeoJson(metadata, createdDataObjectRemote);
            const feature = createFeature(geoJson, `EPSG:${environment.DATASET_SRID}`);

            addFeatureToMap(map, feature);
        },
        [createdDataObjectRemote, map]
    );

    useEffect(
        () => {
            if (!featureCollection || !initRef.current) {
                return;
            }

            initRef.current = false;

            (async () => {
                const olMap = await createMap(featureCollection);

                addInteractions(olMap);
                setMap(olMap);
            })();
        },
        [featureCollection]
    );

    return (
        <MapContext.Provider value={{ map, analysisResult, setAnalysisResult }}>
            {children}
        </MapContext.Provider>
    );
}

export const MapContext = createContext({});
export const useMap = () => useContext(MapContext);