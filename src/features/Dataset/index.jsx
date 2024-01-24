import { useState } from 'react';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createDataObject } from 'store/slices/objectSlice';
import { toggleCriticalUsers } from 'store/slices/mapSlice';
import { FeatureInfo, FeatureContextMenu, MapView, MapContextMenu } from 'features';
import { useBreadcrumbs } from 'features/Breadcrumbs';
import { Menu, MenuItem, SubMenu, MenuDivider } from '@szhsin/react-menu';
import { useModal } from 'context/ModalProvider';
import { modalType } from 'components/Modals';
import { createFeatureGeoJson } from 'context/DatasetProvider/helpers';
import PlaceSearch from 'components/PlaceSearch';
import MapProvider from 'context/MapProvider';
import DatasetProvider from 'context/DatasetProvider';
import DatasetTable from './DatasetTable';
import styles from './Dataset.module.scss';

export default function Dataset() {
   const dataset = useLoaderData();
   const metadata = dataset.definition.ForvaltningsObjektPropertiesMetadata;
   useBreadcrumbs(dataset.definition);

   const { id } = useParams();
   const navigate = useNavigate();
   const [tableExpanded, setTableExpanded] = useState(false);
   const createdDataObject = useSelector(state => state.object.createdDataObject);
   const user = useSelector(state => state.app.user);
   const showCriticalUsers = useSelector(state => state.map.showCriticalUsers);
   const dispatch = useDispatch();
   const { showModal } = useModal();

   function create() {
      const geoJson = createFeatureGeoJson(metadata);
      dispatch(createDataObject(geoJson));
   }

   async function deleteDataset() {
      const { result: confirmed } = await showModal({
         type: modalType.CONFIRM,
         title: 'Slett datasett',
         body: `Er du sikker på at du vil slette datasettet «${dataset.definition.Name}»? Handlingen kan ikke angres.`,
         okText: 'Slett',
         className: styles.confirmDeleteModal
      });

      if (!confirmed) {
         return;
      }

      const { result } = await showModal({
         type: modalType.DELETE_DATASET,
         datasetId: dataset.definition.Id,
         datasetName: dataset.definition.Name
      });

      if (result) {
         navigate('/');
      }
   }

   function _showCriticalUsers() {
      dispatch(toggleCriticalUsers(!showCriticalUsers));
   }

   function showAdminButtons() {
      return user?.organization === dataset.definition.Organization;
   }

   return (
      <>
         <div className={styles.header}>
            <heading-text>
               <h1 underline="true">{dataset.definition.Name}</h1>
            </heading-text>

            <Menu
               menuButton={<button className={styles.menu}></button>}
               align="end"
               arrow={true}
               className={styles.importMenu}
            >
               <MenuItem onClick={create} disabled={createdDataObject !== null}>
                  <span className={styles.createObject}>Nytt objekt</span>
               </MenuItem>
               <MenuDivider />
               <MenuItem onClick={_showCriticalUsers}>
                  <span className={styles.criticalUser}>{!showCriticalUsers ? 'Vis' : 'Skjul'} kritiske brukere</span>
               </MenuItem>
               <MenuDivider />
               {
                  showAdminButtons() ?
                     <>
                        <MenuItem onClick={() => navigate(`/datasett/${id}/definisjoner`)}>
                           <span className={styles.definitions}>Definisjoner</span>
                        </MenuItem>
                        <MenuItem onClick={() => navigate(`/datasett/${id}/tilganger`)}>
                           <span className={styles.accessControl}>Tilganger</span>
                        </MenuItem>
                        <SubMenu
                           label={<span className={styles.importData}>Importér data</span>}
                           className={styles.subMenu}
                        >
                           <MenuItem onClick={() => navigate(`/datasett/${id}/import/geojson`)}>GeoJSON</MenuItem>
                           <MenuItem onClick={() => navigate(`/datasett/${id}/import/csv`)}>CSV</MenuItem>
                        </SubMenu>
                        <MenuDivider />
                        <MenuItem onClick={deleteDataset}>
                           <span className={styles.deleteDataset}>Slett datasett...</span>
                        </MenuItem>
                     </> :
                     null
               }
            </Menu>
         </div>

         <DatasetProvider dataset={dataset}>
            <MapProvider>
               <div className={styles.mapContainer}>
                  <FeatureInfo />

                  <div>
                     <div className={styles.placeSearch}>
                        <PlaceSearch />
                     </div>

                     <MapView />

                     <MapContextMenu />

                     <FeatureContextMenu />
                  </div>
               </div>

               <div className={`${styles.tableContainer} ${tableExpanded ? styles.expanded : ''}`}>
                  <div className={styles.expandTable}>
                     <gn-button>
                        <button
                           onClick={() => setTableExpanded(!tableExpanded)}
                        >
                           {!tableExpanded ? 'Åpne' : 'Lukk'} tabellvisning
                        </button>
                     </gn-button>
                  </div>

                  <div className={styles.table}>
                     <DatasetTable />
                  </div>
               </div>
            </MapProvider>
         </DatasetProvider>
      </>
   );
}
