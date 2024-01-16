import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLoaderData } from 'react-router-dom';
import { useAddDatasetObjectsMutation, useDeleteAllDatasetObjectsMutation } from 'store/services/api';
import { useBreadcrumbs } from 'features/Breadcrumbs';
import { filesize } from 'filesize';
import { detectGeometryColumns, mapCsvToObjects } from './helpers';
import { Checkbox } from 'components/Form/Controllers';
import { useModal } from 'context/ModalProvider';
import { modalType } from 'components/Modals';import Papa from 'papaparse';
import Files from 'react-files';
import projections from 'config/map/projections.json';
import Spinner from 'components/Spinner';
import styles from './DatasetImportCsv.module.scss';

export default function DatasetImportCsv() {
   const dataset = useLoaderData();
   useBreadcrumbs(dataset);

   const metadatas = dataset.ForvaltningsObjektPropertiesMetadata;
   const datasetSrId = dataset.srid || 4326;
   const [file, setFile] = useState(null);
   const [properties, setProperties] = useState(null);
   const [mappings, setMappings] = useState(createMappings());
   const [importSrId, setImportSrId] = useState(4326);
   const [emptyFirst, setEmptyFirst] = useState(false);
   const [loading, setLoading] = useState(false);
   const user = useSelector(state => state.app.user);
   const csvRef = useRef(null);
   const geomColumnsRef = useRef(null);
   const [addDatasetObjects] = useAddDatasetObjectsMutation();
   const [deleteAllDatasetObjects] = useDeleteAllDatasetObjectsMutation();
   const { showModal } = useModal();

   async function readFile(file) {
      try {
         const { data: rows } = await parseFile(file, { delimiter: ',', skipEmptyLines: true, header: true });
         const geomColumns = detectGeometryColumns(rows);

         if (geomColumns === null) {
            await showModal({
               type: modalType.INFO,
               variant: 'error',
               title: 'Feil',
               body: 'CSV-filen inneholder ingen geometrikolonne.'
            });

            setFile(null);
            return;
         }

         const firstRow = { ...rows[0] };
         Object.values(geomColumns)[0].forEach(column => delete firstRow[column]);

         setProperties(firstRow);
         geomColumnsRef.current = geomColumns;
         csvRef.current = rows;
      } catch (error) {
         console.error(error);

         await showModal({
            type: modalType.INFO,
            variant: 'error',
            title: 'Feil',
            body: 'Kunne ikke lese CSV-fil.'
         });
      }
   }

   async function parseFile(file, options) {
      return new Promise((resolve, reject) => {
         const _options = {
            ...options,
            error: error => {
               reject(error);
            },
            complete: results => {
               resolve(results);
            }
         }

         Papa.parse(file, _options);
      });
   }

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

   async function handleImport() {
      const { objects } = mapCsvToObjects(csvRef.current, geomColumnsRef.current, mappings, importSrId, datasetSrId, user);

      if (!objects.length) {
         await showModal({
            type: modalType.INFO,
            variant: 'error',
            title: 'Feil',
            body: 'Ingen gyldige objekter ble funnet.'
         });

         return;
      }

      setLoading(true);

      if (emptyFirst) {
         try {
            await deleteAllDatasetObjects({ table: dataset.TableName, tableId: dataset.Id }).unwrap();
         } catch (error) {
            console.error(error);

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
         console.log(error);
         setLoading(false);

         await showModal({
            type: modalType.INFO,
            variant: 'error',
            title: 'Feil',
            body: 'CSV-filen kunne ikke importeres.'
         });
      }
   }

   function resetForm() {
      setFile(null);
      setProperties(null);
      setMappings(createMappings());
      setImportSrId(4326);
      setEmptyFirst(false);
      csvRef.current = null;
      geomColumnsRef.current = null;
   }

   function getFileSize() {
      return filesize(file.size, { locale: 'no' });
   }

   return (
      <>
         <heading-text>
            <h1 underline="true">Importer CSV</h1>
         </heading-text>

         <div className="container">
            <Files
               className={styles.fileDropzone}
               onChange={handleFileAdded}
               accepts={['.csv']}
               clickable
            >
               {
                  file === null ?
                     <i>Klikk for å legge til datasett (.csv)</i> :
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
                                 {Object.entries(mappings).map(entry => <td key={entry[0]}>{properties[entry[1]] || '-'}</td>)}
                              </tr>
                           </tbody>
                        </table>
                     </gn-table>

                     <div className={styles.emptyFirst}>
                        <Checkbox
                           id="empty-first"
                           label="Tøm database før import"
                           field={{
                              value: emptyFirst,
                              onChange: event => setEmptyFirst(event.target.checked)
                           }}
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