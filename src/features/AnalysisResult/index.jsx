import { useMap } from 'context/MapProvider';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { addAnalysisFeaturesToMap, convertDistance, convertDuration, highlightRoute, removeAnalysisFeaturesFromMap } from './helpers';
import { selectFeature } from 'store/slices/mapSlice';
import { renderProperty } from 'utils/helpers/general';
import { getFeatureById, getLayer, getProperties, getVectorSource } from 'utils/helpers/map';
import { inPlaceSort } from 'fast-sort';
import styles from './AnalysisResult.module.scss';

export default function AnalysisResult() {
   const { map, analysisResult, setAnalysisResult } = useMap();
   const [selectedResultId, setSelectedResultId] = useState(null);
   const [expanded, setExpanded] = useState(true);
   const selectedFeature = useSelector(state => state.map.selectedFeature);
   const dispatch = useDispatch();

   useEffect(
      () => {
         if (analysisResult === null || map === null) {
            return;
         }

         addAnalysisFeaturesToMap(map, analysisResult.featureCollection);
      },
      [analysisResult, map]
   );

   const { start, resultList } = useMemo(
      () => {
         if (analysisResult === null || map === null) {
            return {
               start: null,
               resultList: []
            };
         }

         const objects = analysisResult.featureCollection.features
            .filter(feature => feature.geometry?.type === 'Point');

         const routes = analysisResult.featureCollection.features
            .filter(feature => feature.geometry?.type !== 'Point');

         const resultList = objects.map(object => {
            const properties = Object.values(object.properties).slice(0, 3)
               .map(value => [value.name, renderProperty(value)]);

            const route = routes
               .find(route => route.properties.destinationId === object.properties.id.value);

            return {
               id: object.properties.id.value,
               properties,
               route: {
                  distance: route.properties.distance || null,
                  duration: route.properties.duration || null,
                  statusCode: route.properties.statusCode || null
               },
               hasRoute: route.properties.distance !== undefined
            };
         });

         inPlaceSort(resultList).by({
            asc: result => result.route.distance || Number.MAX_VALUE
         });

         const feature = getFeatureById(map, analysisResult.featureId);
         const props = getProperties(feature);

         const properties = Object.values(props).slice(0, 3)
            .map(value => [value.name, renderProperty(value)]);

         return {
            start: {
               id: analysisResult.featureId,
               properties
            },
            resultList
         };
      },
      [analysisResult, map]
   );

   function toggleExpanded() {
      setExpanded(!expanded);
   }

   function selectRoute(result) {
      const layer = getLayer(map, 'routes');
      const source = getVectorSource(layer);
      const route = source.getFeatures().find(feature => feature.get('destinationId') === result.id);

      setSelectedResultId(result.id);
      highlightRoute(layer, route);

      const view = map.getView();
      view.fit(route.getGeometry(), { padding: [50, 50, 50, 50] });
   }

   function selectObject(feature) {
      dispatch(selectFeature({ id: feature.id, zoom: true }));
   }

   function handleClose() {
      if (selectedFeature !== null) {
         const feature = getFeatureById(map, selectedFeature.id);

         if (feature?.get('_featureType') === 'analysis') {
            dispatch(selectFeature(null));
         }
      }

      setSelectedResultId(null);
      removeAnalysisFeaturesFromMap(map);
      setAnalysisResult(null);
   }

   function renderResult() {
      return resultList.map(result => (
         <div
            key={result.id}
            className={`${styles.result} ${selectedResultId === result.id ? styles.selected : ''}`}
            role="button"
         >
            <div className={styles.object}>
               {
                  result.properties.map(prop => (
                     <div key={prop[0]} className={styles.property}>
                        <span>{prop[0]}:</span>
                        <span title={prop[1]}>{prop[1]}</span>
                     </div>
                  ))
               }
            </div>
            <div className={styles.route}>
               {
                  result.hasRoute ?
                     <>
                        <div className={styles.property}>
                           <span>Avstand:</span>
                           <span>{convertDistance(result.route.distance)}</span>
                        </div>
                        <div className={styles.property}>
                           <span>Est. kjøretid:</span>
                           <span>{convertDuration(result.route.duration)}</span>
                        </div>
                     </> :
                     <div>
                        <em>Kunne ikke beregne rute</em>
                     </div>
               }
            </div>
            <div className={styles.buttons}>
               <button
                  onClick={() => selectRoute(result)}
                  className={`buttonLink ${styles.goToRoute}`}
                  style={{ visibility: result.hasRoute ? 'visible' : 'hidden' }}
               >
                  Vis rute
               </button>

               <button
                  onClick={() => selectObject(result)}
                  className={`buttonLink ${styles.goToObject}`}
               >
                  Gå til objekt
               </button>
            </div>
         </div>
      ));
   }

   if (start === null) {
      return null;
   }

   return (
      <div className={`${styles.analysisResult} ${expanded ? styles.expanded : ''}`}>
         <gn-button>
            <button onClick={toggleExpanded} className={styles.expandButton}>
               <span></span>
            </button>
         </gn-button>

         <div className={styles.resultList}>
            <h4>Analyseresultat</h4>

            <button onClick={handleClose} className={styles.closeButton}></button>

            <div className={styles.start}>
               <div className={styles.properties}>
                  {
                     start.properties.map(prop => (
                        <div key={prop[0]} className={styles.property}>
                           <span>{prop[0]}:</span>
                           <span title={prop[1]}>{prop[1]}</span>
                        </div>
                     ))
                  }
                  <div className={styles.buttons}>
                     <button
                        onClick={() => selectObject(start)}
                        className={`buttonLink ${styles.goToObject}`}
                     >
                        Gå til objekt
                     </button>
                  </div>
               </div>
            </div>

            <h4>Destinasjoner ({resultList.length}):</h4>

            <div className={styles.results}>
               {renderResult()}
            </div>
         </div>
      </div>
   );
}