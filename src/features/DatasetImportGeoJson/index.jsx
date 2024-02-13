import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLoaderData } from 'react-router-dom';
import { useAddDatasetObjectsMutation, useDeleteAllDatasetObjectsMutation } from 'store/services/api';
import { useBreadcrumbs } from 'features/Breadcrumbs';
import { filesize } from 'filesize';
import { getSrId } from 'utils/helpers/map';
import { mapGeoJsonToObjects } from './helpers';
import { Checkbox } from 'components/Form';
import { useModal } from 'context/ModalProvider';
import { modalType } from 'components/Modals';
import { isNil } from 'lodash';
import gjv from 'geojson-validation';
import Files from 'react-files';
import projections from 'config/map/projections.json';
import Spinner from 'components/Spinner';
import styles from './DatasetImportGeoJson.module.scss';

export default function DatasetImportGeoJson() {
   const dataset = useLoaderData();
   useBreadcrumbs(dataset);

   const metadatas = dataset.ForvaltningsObjektPropertiesMetadata;
   const [file, setFile] = useState(null);
   const [properties, setProperties] = useState(null);
   const [mappings, setMappings] = useState(createMappings());
   const [importSrId, setImportSrId] = useState(4326);
   const [emptyFirst, setEmptyFirst] = useState(false);
   const [loading, setLoading] = useState(false);
   const user = useSelector(state => state.app.user);
   const geoJsonRef = useRef(null);
   const [addDatasetObjects] = useAddDatasetObjectsMutation();
   const [deleteAllDatasetObjects] = useDeleteAllDatasetObjectsMutation();
   const { showModal } = useModal();

   function createMappings() {
      const mappings = {};
      metadatas.forEach(metadata => mappings[metadata.ColumnName] = '');

      return mappings;
   }

   function handleFileAdded(files) {
      setFile(files[0]);
      readFile(files[0]);
   }

   function handleMappingChange(columnName, propName) {
      setMappings({
         ...mappings,
         [columnName]: propName
      });
   }
   
   async function readFile(file) {
      let parsed;

      try {
         const contents = await file.text();
         parsed = JSON.parse(contents);
      } catch (error) {
         console.error(error);

         await showModal({
            type: modalType.INFO,
            variant: 'error',
            title: 'Feil',
            body: 'Kunne ikke lese JSON-filen.'
         });

         return;
      }

      const isValid = gjv.isFeatureCollection(parsed);

      if (isValid) {
         setImportSrId(getSrId(parsed));
         setProperties(parsed.features[0].properties);
         geoJsonRef.current = parsed;
      } else {
         await showModal({
            type: modalType.INFO,
            variant: 'error',
            title: 'Feil',
            body: 'GeoJSON-filen er ikke en gyldig FeatureCollection'
         });
      }
   }

   async function handleImport() {
      const objects = mapGeoJsonToObjects(geoJsonRef.current, mappings, importSrId, user);

      if (!objects.length) {
         return;
      }

      setLoading(true);

      if (emptyFirst) {
         try {
            await deleteAllDatasetObjects({ table: dataset.TableName, tableId: dataset.Id }).unwrap();
         } catch (error) {
            console.error(error);
            setLoading(false);

            await showModal({
               type: modalType.INFO,
               variant: 'error',
               title: 'Feil',
               body: 'Kunne ikke tømme databasen.'
            });

            return;
         }
      }

      try {
         const response = await addDatasetObjects({ payload: objects, table: dataset.TableName, tableId: dataset.Id }).unwrap();
         setLoading(false);

         await showModal({
            type: modalType.INFO,
            variant: 'success',
            title: 'Datasett importert',
            body: `${response.length} objekt(er) ble importert til datasettet.`
         });

         resetForm();
      } catch (error) {
         console.error(error);
         setLoading(false);

         await showModal({
            type: modalType.INFO,
            variant: 'error',
            title: 'Feil',
            body: 'GeoJSON-filen kunne ikke importeres.'
         });
      }
   }

   function resetForm() {
      setFile(null);
      setImportSrId(4326);
      setMappings(createMappings());
      setProperties(null);
      setEmptyFirst(null);
      geoJsonRef.current = null;
   }

   function renderProperty(propName) {
      const property = properties[propName];     
      return !isNil(property) ? property.toString() : '-';
   }

   function getFileSize() {
      return filesize(file.size, { locale: 'no' });
   }

   return (
      <>
         <heading-text>
            <h1 underline="true">Importer GeoJSON</h1>
         </heading-text>

         <div className="container">
            <Files
               className={styles.fileDropzone}
               onChange={handleFileAdded}
               accepts={['.geojson', '.json']}
               clickable
            >
               {
                  file === null ?
                     <i>Klikk for å legge til datasett (.geojson, .json)</i> :
                     <i>{file.name} ({getFileSize()})</i>
               }
            </Files>
            {
               properties !== null ?
                  <div>
                     <heading-text>
                        <h4 className={styles.h4}>Projeksjon</h4>
                     </heading-text>

                     <div className={styles.epsgSelect}>
                        <gn-select block="">
                           <select
                              value={importSrId}
                              onChange={event => setImportSrId(event.target.value)}
                           >
                              {projections.map(projection => <option key={projection.epsg} value={projection.srId}>{projection.epsg}</option>)}
                           </select>
                        </gn-select>
                     </div>

                     <heading-text>
                        <h4 className={styles.h4}>Tilordning av egenskaper</h4>
                     </heading-text>

                     <gn-table>
                        <table className={styles.mappingTable}>
                           <thead>
                              <tr>
                                 <th>Kolonne</th>
                                 <th>Egenskap</th>
                              </tr>
                           </thead>
                           <tbody>
                              {
                                 metadatas.map(metadata => (
                                    <tr key={metadata.ColumnName}>
                                       <td>{metadata.Name}</td>
                                       <td>
                                          <gn-select block="">
                                             <select
                                                onChange={event => handleMappingChange(metadata.ColumnName, event.target.value)}
                                             >
                                                <option value=''>Ikke mappet</option>
                                                {Object.keys(properties).map(key => <option key={key} value={key}>{key}</option>)}
                                             </select>
                                          </gn-select>
                                       </td>
                                    </tr>
                                 ))
                              }
                           </tbody>
                        </table>
                     </gn-table>

                     <heading-text>
                        <h4 className={styles.h4}>Forhåndsvisning</h4>
                     </heading-text>

                     <gn-table>
                        <table className={styles.previewTable}>
                           <thead>
                              <tr>
                                 {metadatas.map(metadata => <th key={metadata.ColumnName}>{metadata.Name}</th>)}
                              </tr>
                           </thead>
                           <tbody>
                              <tr>
                                 {Object.entries(mappings).map(entry => <td key={entry[0]}>{renderProperty(entry[1])}</td>)}
                              </tr>
                           </tbody>
                        </table>
                     </gn-table>

                     <div className={styles.emptyFirst}>
                        <Checkbox
                           id="empty-first"
                           label="Tøm database før import"
                           value={emptyFirst}
                           onChange={event => setEmptyFirst(event.target.checked)}
                        />
                     </div>

                     <div className={styles.submit}>
                        <gn-button>
                           <button onClick={handleImport} disabled={loading}>Importér datasett</button>
                        </gn-button>
                        {
                           loading ?
                              <Spinner style={{ position: 'absolute', top: '2px', right: '-42px' }} /> :
                              null
                        }
                     </div>
                  </div> :
                  null
            }
         </div>
      </>
   );
}