import { useMemo, useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectFeature } from 'store/slices/mapSlice';
import { deleteDataObjects, setShowObjectsInExtent, updateDataObject } from 'store/slices/objectSlice';
import { Table, Header, HeaderRow, Body, HeaderCell, Row, Cell } from '@table-library/react-table-library/table';
import { useTheme } from '@table-library/react-table-library/theme';
import { usePagination } from '@table-library/react-table-library/pagination';
import { HeaderCellSort, useSort } from '@table-library/react-table-library/sort';
import { SelectTypes, useRowSelect } from "@table-library/react-table-library/select";
import { useDeleteDatasetObjectsMutation, useUpdateDatasetObjectMutation } from 'store/services/api';
import { inPlaceSort } from 'fast-sort';
import { isNil } from 'lodash';
import { renderProperty } from 'utils/helpers/general';
import { getTableStyle } from './helpers';
import { useDataset } from 'context/DatasetProvider';
import { useMap } from 'context/MapProvider';
import { useModal } from 'context/ModalProvider';
import { useSignalR } from 'context/SignalRProvider';
import { modalType } from 'components/Modals';
import { messageType } from 'config/messageHandlers';
import { BooleanSelect, DatePicker, Select, TextField } from 'components/Form';
import useDebounceValue from 'hooks/useDebouceValue';
import ReactPaginate from 'react-paginate';
import useFilters from './Filters/useFilters';
import { RemoteEditor } from 'components';
import Filters from './Filters';
import styles from './DatasetTable.module.scss';


export default function DatasetTable() {
    const { objects, definition, metadata, allowedValues } = useDataset();
    const { connectionId, send } = useSignalR();
    const { map } = useMap();
    const [editMode, setEditMode] = useState(false);
    const [update] = useUpdateDatasetObjectMutation();
    const [_delete] = useDeleteDatasetObjectsMutation();
    const { showModal } = useModal();
    const [selectedRows, setSelectedRows] = useState({ ids: [] });
    const [showOnlyInExtent, setShowOnlyInExtent] = useState(false);
    const debouncedShowOnlyInExtent = useDebounceValue(showOnlyInExtent, 500);
    const visibleTableRowsRef = useRef([]);
    const theme = useTheme(tableTheme);
    const { data, setFilters } = useFilters(objects, metadata);
    const user = useSelector(state => state.app.user);
    const _editedDataObjects = useSelector(state => state.object.editedDataObjects);
    const dispatch = useDispatch();

    const editedDataObjects = useMemo(
        () => {
            return _editedDataObjects
                .filter(object => object.connectionId !== connectionId && object.datasetId === definition.Id);
        },
        [_editedDataObjects, connectionId, definition.Id]
    );    

    useEffect(
        () => {
            if (!isNil(map)) {
                dispatch(setShowObjectsInExtent(debouncedShowOnlyInExtent));
                map.dispatchEvent('moveend');
            }
        },
        [debouncedShowOnlyInExtent, dispatch, map]
    );

    useEffect(
        () => {
            return () => dispatch(setShowObjectsInExtent(false));
        },
        [dispatch]
    );

    const tableStyle = useMemo(() => getTableStyle(definition), [definition]);

    const pagination = usePagination(data, {
        state: {
            page: 0,
            size: 10
        }
    });

    const select = useRowSelect(data,
        {
            state: selectedRows,
            onChange: handleSelectChange
        },
        {
            rowSelect: SelectTypes.SingleSelect,
            buttonSelect: SelectTypes.MultiSelect
        }
    );

    const sortFns = useMemo(
        () => {
            const fns = {
                ID: array => inPlaceSort(array).by(item => item.id),
            };

            metadata.forEach(data => {
                fns[data.Name.toUpperCase()] = array => inPlaceSort(array).by(item => item[data.ColumnName]);
            });

            return fns;
        },
        [metadata]
    );

    const sort = useSort(data, {}, { sortFns });

    function handlePageClick({ selected }) {
        pagination.fns.onSetPage(selected);
    }

    function handleSelectChange(_, state) {
        setSelectedRows(state);
    }

    function handleRowClick(item, event) {
        event.preventDefault();
        event.stopPropagation()

        if (!event.shiftKey) {
            dispatch(selectFeature({ id: item.id, zoom: true }));
        }
    }

    function canEdit() {

        return user !== null && (definition.Viewers === null || !definition.Viewers.includes(user.organization) || hasAccessByProperties);
    }

    function hasAccessByProperties() {
        definition.ForvaltningsObjektPropertiesMetadata.forEach(prop => {
            prop.AccessByProperties.forEach(access => {
                if(access.Contributors.includes(user.organization)) {
                    return true;
                }
            });
        });

        return false;
    }

    function canEditObject(objectId) {
        return !editedDataObjects.some(dataObject => dataObject.objectId === objectId);
    }

    function renderFormControl(name, value, dataType, objectId) {
        if (dataType === 'bool') {
            return (
                <BooleanSelect
                    name={name}
                    value={value}
                    onChange={event => handleUpdate(event, objectId)}
                />
            );
        }

        const allowedValuesForProp = allowedValues[name];

        if (dataType === 'text' && allowedValuesForProp !== null) {
            const options = allowedValuesForProp.map(option => ({ value: option, label: option }));

            return (
                <Select
                    name={name}
                    value={value}
                    options={options}
                    onChange={event => handleUpdate(event, objectId)}
                    allowEmpty={false}
                />
            );
        }

        if (dataType === 'timestamp') {
            return (
                <DatePicker
                    name={name}
                    value={value}
                    onChange={event => handleUpdate(event, objectId)}
                />
            );
        }

        return (
            <TextField
                name={name}
                value={value}
                onChange={event => handleUpdate(event, objectId)}
                mode="blur"
            />
        );
    }

    function renderRemoteEditor(objectId) {
        if (editedDataObjects.length === 0) {
            return null;
        }

        const dataObject = editedDataObjects.find(dataObject => dataObject.objectId === objectId);

        return dataObject ?
            <RemoteEditor editor={dataObject} className={styles.remoteEditor} /> :
            null;
    }

    async function handleUpdate(event, objectId) {

        let dataObjectNode = data.nodes.find(dataObject => dataObject.id === objectId);

        const { name, value } = event.target;
        let dataObject = {...dataObjectNode};
        dataObject = {...dataObject, [name]: value};
        console.log(dataObject);
        const payload =  dataObject ;

        try {
            await update({
                payload,
                tableId: definition.Id,
                ownerOrg: definition.Organization,
                definition: definition
            }).unwrap();


            dispatch(updateDataObject({ id: objectId, properties: payload }));
            //await send(messageType.SendObjectUpdated, { objectId, datasetId: definition.Id, properties: payload });
        } catch (error) {
            console.error(error);

            await showModal({
                type: modalType.INFO,
                variant: 'error',
                title: 'Feil',
                body: 'Objektet kunne ikke oppdateres.'
            });
        }
    }

    async function deleteRows() {
        const editedObjectIds = editedDataObjects
            .map(dataObject => dataObject.objectId);

        const toDelete = select.state.ids
            .filter(id => visibleTableRowsRef.current.includes(id) && !editedObjectIds.includes(id));

        const count = toDelete.length;

        if (count === 0) {
            return;
        }

        const { result } = await showModal({
            type: modalType.CONFIRM,
            title: 'Slett objekt',
            body: `Er du sikker på at du vil slette ${count === 1 ? 'objektet' : `${count} objekter`}?`,
            okText: 'Slett'
        });

        if (!result) {
            return;
        }

        try {
            await _delete({
                ids: toDelete,
                tableId: definition.Id
            }).unwrap();

            setSelectedRows({ ids: [] });
            dispatch(deleteDataObjects(toDelete));

            //await send(messageType.SendObjectsDeleted, { datasetId: definition.Id, ids: toDelete });
        } catch (error) {
            console.error(error);

            await showModal({
                type: modalType.INFO,
                variant: 'error',
                title: 'Feil',
                body: 'Objektene kunne ikke slettes.'
            });
        }
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.buttonsTop}>
                    <div>
                        {
                            canEdit() && (
                                <gn-button>
                                    <button onClick={() => setEditMode(!editMode)} className={styles.edit}>{!editMode ? 'Rediger tabell' : 'Avslutt redigering'}</button>
                                </gn-button>
                            )
                        }

                        <div className={styles.checkbox}>
                            <gn-input>
                                <input
                                    id="features-in-extent"
                                    type="checkbox"
                                    checked={showOnlyInExtent}
                                    onChange={event => setShowOnlyInExtent(event.target.checked)}
                                />
                            </gn-input>
                            <gn-label>
                                <label htmlFor="features-in-extent">Vis kun objekter i kartutsnitt</label>
                            </gn-label>
                        </div>
                    </div>
                    {
                        editMode && selectedRows.ids.length > 0 ?
                            <gn-button color="danger">
                                <button onClick={deleteRows}>Slett valgte rader</button>
                            </gn-button> :
                            null
                    }
                </div>

                <Filters
                    definition={definition}
                    onChange={setFilters}
                />

                <gn-table hoverable="">
                    <Table
                        data={data}
                        pagination={pagination}
                        theme={theme}
                        sort={sort}
                        select={select}
                        style={tableStyle}
                    >
                        {
                            tableList => {
                                visibleTableRowsRef.current = tableList.map(item => item.id);

                                return (
                                    tableList.length ?
                                        <>
                                            <Header>
                                                <HeaderRow>
                                                    <HeaderCellSort sortKey="ID">ID</HeaderCellSort>
                                                    {
                                                        metadata.map(data => <HeaderCellSort key={data.Name} sortKey={data.Name.toUpperCase()}>{data.Name}</HeaderCellSort>)
                                                    }
                                                    <HeaderCell className={styles.checkboxCell}>
                                                        {
                                                            editMode ?
                                                                <label>
                                                                    <gn-input>
                                                                        <input type="checkbox" checked={select.state.all} onChange={select.fns.onToggleAll} />
                                                                    </gn-input>
                                                                </label> :
                                                                null
                                                        }
                                                    </HeaderCell>
                                                </HeaderRow>
                                            </Header>
                                            <Body>
                                                {
                                                    tableList.map(item => (
                                                        <Row
                                                            key={item.id}
                                                            item={item}
                                                            className={`${styles.tableRow}`}
                                                            onClick={handleRowClick}
                                                        >
                                                            <Cell className={styles.idCell}>
                                                                {item.id}
                                                                {renderRemoteEditor(item.id)}
                                                            </Cell>
                                                            {
                                                                metadata.map(data => (
                                                                    <Cell key={data.ColumnName}>
                                                                        {
                                                                            !editMode || !canEditObject(item.id) ?
                                                                                renderProperty({ value: item[data.ColumnName], dataType: data.DataType }) :
                                                                                renderFormControl(data.ColumnName, item[data.ColumnName], data.DataType, item.id)
                                                                        }
                                                                    </Cell>
                                                                ))
                                                            }
                                                            <Cell stiff className={styles.checkboxCell}>
                                                                {
                                                                    editMode && canEditObject(item.id) ?
                                                                        <label>
                                                                            <gn-input>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={select.state.ids.includes(item.id)}
                                                                                    onChange={() => select.fns.onToggleById(item.id)}
                                                                                />
                                                                            </gn-input>
                                                                        </label> :
                                                                        null
                                                                }
                                                            </Cell>
                                                        </Row>
                                                    ))
                                                }
                                            </Body>
                                        </> :
                                        null
                                )
                            }
                        }
                    </Table>
                </gn-table>
            </div>

            <div className={styles.pagination}>
                <ReactPaginate
                    breakLabel="..."
                    nextLabel="Neste"
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={5}
                    pageCount={pagination.state.getTotalPages(data.nodes)}
                    previousLabel="Forrige"
                    renderOnZeroPageCount={null}
                />
            </div>
        </>
    );
}

const tableTheme = {
    Row: `
      &.row-select-selected,
      &.row-select-single-selected {
         font-weight: normal;
         background-color: rgba(0, 0, 0, .05);
      }
   `
};
