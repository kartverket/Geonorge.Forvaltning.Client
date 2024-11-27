import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useBlocker, useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { FeatureInfo, AnalysisResult } from 'features';
import { FeatureContextMenu, Legend, MapContextMenu, MapView, PlaceSearch } from 'features/Map';
import { useBreadcrumbs } from 'features/Breadcrumbs';
import { Menu, MenuItem, SubMenu, MenuDivider } from '@szhsin/react-menu';
import { toggleFullscreen as _toggleFullscreen } from 'store/slices/appSlice';
import { useModal } from 'context/ModalProvider';
import { modalType } from 'components/Modals';
import { toGeoJson } from './export';
import MapProvider from 'context/MapProvider';
import DatasetProvider from 'context/DatasetProvider';
import DatasetTable from './DatasetTable';
import SignalRProvider from 'context/SignalRProvider';
import messageHandlers from 'config/messageHandlers';
import styles from './Dataset.module.scss';
import Cursors from './Cursors';

export default function Dataset() {
    const dataset = useLoaderData();
    useBreadcrumbs(dataset.definition);

    const { id } = useParams();
    const navigate = useNavigate();
    const [tableExpanded, setTableExpanded] = useState(false);
    const user = useSelector(state => state.app.user);
    // const selectedFeature = useSelector(state => state.map.selectedFeature);
    // const editMode = useSelector(state => state.map.editMode);
    const fullscreen = useSelector(state => state.app.fullscreen);
    const { showModal } = useModal();
    const dispatch = useDispatch();

    useBlocker(({ currentLocation, nextLocation }) => {
        if (currentLocation.pathname !== nextLocation.pathname) {
            dispatch(_toggleFullscreen(false));
        }

        return false;
    });

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

    function exportToGeoJson() {
        toGeoJson(dataset);
    }

    function showAdminMenu() {
        return user?.organization === dataset.definition.Organization;
    }

    function toggleFullscreen() {
        dispatch(_toggleFullscreen(!fullscreen))
    }

    return (
        <div className={`${fullscreen ? styles.fullscreen : ''}`}>
            <div className={styles.header}>
                <heading-text>
                    <h1 underline="true">{dataset.definition.Name}</h1>
                </heading-text>

                <div className={styles.actionButtons}>
                    {
                        showAdminMenu() ?
                            <Menu
                                menuButton={<button className={styles.menu}></button>}
                                align="end"
                                arrow={true}
                                className={styles.adminMenu}
                            >
                                <MenuItem onClick={() => navigate(`/datasett/${id}/definisjoner`)}>
                                    <span className={styles.definitions}>Definisjoner</span>
                                </MenuItem>
                                <MenuItem onClick={() => navigate(`/datasett/${id}/tilganger`)}>
                                    <span className={styles.accessControl}>Tilganger</span>
                                </MenuItem>
                                <SubMenu
                                    label={<span className={styles.importData}>Importér</span>}
                                    className={styles.subMenu}
                                >
                                    <MenuItem onClick={() => navigate(`/datasett/${id}/import/geojson`)}>GeoJSON</MenuItem>
                                    <MenuItem onClick={() => navigate(`/datasett/${id}/import/csv`)}>CSV</MenuItem>
                                </SubMenu>
                                <SubMenu
                                    label={<span className={styles.exportData}>Eksportér</span>}
                                    className={styles.subMenu}
                                >
                                    <MenuItem onClick={exportToGeoJson}>GeoJSON</MenuItem>
                                </SubMenu>
                                <MenuDivider />
                                <MenuItem onClick={deleteDataset}>
                                    <span className={styles.deleteDataset}>Slett datasett...</span>
                                </MenuItem>
                            </Menu> :
                            null
                    }
                </div>
            </div>

            <SignalRProvider messageHandlers={messageHandlers}>
                <DatasetProvider dataset={dataset}>
                    <MapProvider>
                        <div className={styles.mapContainer}>
                            <FeatureInfo />

                            <div className={styles.mapView}>
                                <div className={styles.placeSearch}>
                                    <PlaceSearch />
                                </div>

                                <Legend />
                                <MapView
                                    fullscreen={fullscreen}
                                    tableExpanded={tableExpanded}
                                />
                                <MapContextMenu />
                                <FeatureContextMenu />

                                <button
                                    onClick={toggleFullscreen}
                                    title={!fullscreen ? 'Aktiver fullskjerm' : 'Deaktiver fullskjerm'}
                                    className={styles.fullscreenButton}
                                ></button>

                                <Cursors />
                            </div>

                            <AnalysisResult />
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
            </SignalRProvider>
        </div>
    );
}
