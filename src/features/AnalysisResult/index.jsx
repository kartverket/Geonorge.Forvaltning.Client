import { useEffect, useMemo, useState } from 'react';
import { useMap } from 'context/MapProvider';
import { useDispatch, useSelector } from 'react-redux';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { Menu, MenuItem } from '@szhsin/react-menu';
import { selectFeature } from 'store/slices/mapSlice';
import { getFeatureById, getLayer, getVectorSource } from 'utils/helpers/map';
import { mapAnalysisResult } from './mapper';
import { addAnalysisFeaturesToMap, convertDistance, convertDuration, highlightRoute, removeAnalysisFeaturesFromMap } from './helpers';
import { toGeoJson } from './exportGeoJson';
import { createMapImages } from './PdfExport/helpers';
import dayjs from 'dayjs';
import PdfExport from './PdfExport';
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

         addAnalysisFeaturesToMap(map, analysisResult);
      },
      [analysisResult, map]
   );

   const { start, resultList } = useMemo(
      () => {
         if (analysisResult === null) {
            return {
               start: null,
               resultList: []
            };
         }

         return mapAnalysisResult(analysisResult);
      },
      [analysisResult]
   );

   function exportToGeoJson() {
      toGeoJson(analysisResult);
   }

   async function exportToPdf() {
      const images = await createMapImages(analysisResult);
      const pdfDocument = <PdfExport featureCollection={analysisResult} images={images} />
      const blob = await pdf(pdfDocument).toBlob();
      const timestamp = dayjs().format('YYYYMMDDHHmmss');
      const fileName = `analyseresultat-${timestamp}.pdf`;

      saveAs(blob, fileName);
   }

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

   function selectObject(feature, featureType, updateUrl) {
      dispatch(selectFeature({ id: feature.id, zoom: true, featureType, updateUrl }));
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

   function renderDestinations() {
      return resultList.map(result => (
         <div
            key={result.id}
            className={`${styles.destination} ${selectedResultId === result.id ? styles.selected : ''}`}
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
                  onClick={() => selectObject(result, 'analysis', false)}
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
      <div className={`${styles.container} ${expanded ? styles.expanded : ''}`}>
         <gn-button>
            <button onClick={toggleExpanded} className={styles.expandButton}>
               <span></span>
            </button>
         </gn-button>

         <div className={styles.analysisResult}>
            <div className={styles.header}>
               <span>Analyseresultat</span>

               <div className={styles.headerButtons}>
                  <Menu
                     menuButton={
                        <button
                           className={`buttonLink ${styles.exportButton}`}
                        >
                           Eksportér
                        </button>
                     }
                     align="end"
                     arrow={true}
                     className={styles.exportMenu}
                  >
                     <MenuItem onClick={exportToGeoJson}>GeoJSON</MenuItem>
                     <MenuItem onClick={exportToPdf}>PDF</MenuItem>
                  </Menu>

                  <button onClick={handleClose} className={styles.closeButton}></button>
               </div>
            </div>

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
                        onClick={() => selectObject(start, 'default', true)}
                        className={`buttonLink ${styles.goToObject}`}
                     >
                        Gå til objekt
                     </button>
                  </div>
               </div>
            </div>

            <div className={styles.subHeader}>Destinasjoner ({resultList.length}):</div>

            <div className={styles.destinations}>
               {renderDestinations()}
            </div>
         </div>
      </div>
   );
}