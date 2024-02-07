import { useEffect, useMemo, useRef, useState } from 'react';
import { useMap } from 'context/MapProvider';
import { useDispatch, useSelector } from 'react-redux';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { ControlledMenu, MenuItem } from '@szhsin/react-menu';
import { selectFeature } from 'store/slices/mapSlice';
import { getFeatureById, getLayer, getVectorSource } from 'utils/helpers/map';
import { mapAnalysisResult } from './mapper';
import { addAnalysisFeaturesToMap, convertDistance, convertDuration, highlightRoute, removeAnalysisFeaturesFromMap } from './helpers';
import { toGeoJson } from './exportGeoJson';
import { createMapImages } from './PdfExport/helpers';
import dayjs from 'dayjs';
import PdfExport from './PdfExport';
import Spinner from 'components/Spinner';
import styles from './AnalysisResult.module.scss';

export default function AnalysisResult() {
   const { map, analysisResult, setAnalysisResult } = useMap();
   const [selectedResultId, setSelectedResultId] = useState(null);
   const [expanded, setExpanded] = useState(true);
   const [exportMenuIsOpen, setExportMenuIsOpen] = useState(false);
   const [loading, setLoading] = useState(null);
   const exportMenuButtonRef = useRef(null);
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
      setLoading(true);

      const images = await createMapImages(analysisResult);
      const pdfDocument = <PdfExport featureCollection={analysisResult} images={images} />
      const blob = await pdf(pdfDocument).toBlob();
      const timestamp = dayjs().format('YYYYMMDDHHmmss');
      const fileName = `analyseresultat-${timestamp}.pdf`;

      saveAs(blob, fileName);
      setLoading(false);
   }
   
   async function handleMenuClose({ value }) {
      if (value === 'geojson') {
         exportToGeoJson();
      } else if (value === 'pdf') {
         await exportToPdf();
      }

      setExportMenuIsOpen(false);
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
                  <button
                     ref={exportMenuButtonRef}
                     onClick={() => setExportMenuIsOpen(true)}
                     className={`buttonLink ${styles.exportButton}`}
                  >
                     Eksportér
                  </button>

                  <ControlledMenu
                     state={exportMenuIsOpen ? 'open' : 'closed'}
                     anchorRef={exportMenuButtonRef}
                     align="end"
                     arrow={true}
                     onClose={handleMenuClose}
                     className={styles.exportMenu}
                  >
                     <MenuItem value="geojson">GeoJSON</MenuItem>
                     <MenuItem value="pdf" disabled={loading}>
                        <div className={styles.menuItem}>
                           <span>PDF</span>
                           {loading && <Spinner className={styles.spinner} />}
                        </div>
                     </MenuItem>
                  </ControlledMenu>

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