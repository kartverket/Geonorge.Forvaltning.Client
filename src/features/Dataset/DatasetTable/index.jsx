import { useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { selectFeature } from 'store/slices/mapSlice';
import { deleteDataObjects, updateDataObject } from 'store/slices/objectSlice';
import { useRevalidator } from 'react-router-dom';
import { Table, Header, HeaderRow, Body, HeaderCell, Row, Cell } from '@table-library/react-table-library/table';
import { useTheme } from '@table-library/react-table-library/theme';
import { usePagination } from '@table-library/react-table-library/pagination';
import { HeaderCellSort, useSort } from '@table-library/react-table-library/sort';
import { SelectTypes, useRowSelect } from "@table-library/react-table-library/select";
import { useDeleteDatasetObjectsMutation, useUpdateDatasetObjectMutation } from 'store/services/api';
import { inPlaceSort } from 'fast-sort';
import { renderProperty } from 'utils/helpers/general';
import { getTableStyle } from './helpers';
import { useDataset } from 'context/DatasetProvider';
import { useModal } from 'context/ModalProvider';
import { modalType } from 'components/Modals';
import { BooleanSelect, DatePicker, Select, TextField } from 'components/Form';
import ReactPaginate from 'react-paginate';
import useFilters from './Filters/useFilters';
import Filters from './Filters';
import styles from './DatasetTable.module.scss';

export default function DatasetTable() {
   const { objects, definition, metadata, allowedValues  } = useDataset();
   const [editMode, setEditMode] = useState(false);
   const [update] = useUpdateDatasetObjectMutation();
   const [_delete] = useDeleteDatasetObjectsMutation();
   const revalidator = useRevalidator();
   const dispatch = useDispatch();
   const { showModal } = useModal();
   const [selectedRows, setSelectedRows] = useState({ ids: [] });
   const visibleTableRowsRef = useRef([]);
   const theme = useTheme(tableTheme);
   const { data, setFilters } = useFilters(objects, metadata);

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

   function renderFormControl(name, value, dataType, objectId) {
      if (dataType === 'bool') {
         return (
            <BooleanSelect
               name={name}
               value={value}
               onChange={({ name, value }) => handleUpdate(name, value, objectId)}
            />
         );
      }

      const selectOptions = allowedValues[name];

      if (dataType === 'text' && selectOptions !== null) {
         return (
            <Select
               name={name}
               value={value}
               options={selectOptions}
               onChange={({ name, value }) => handleUpdate(name, value, objectId)}
               allowEmpty={false}
            />
         );
      }

      if (dataType === 'timestamp') {
         return (
            <DatePicker
               name={name}
               value={value}
               onChange={({ name, value }) => handleUpdate(name, value, objectId)}
            />
         );
      }

      return (
         <TextField
            name={name}
            value={value}
            onChange={({ name, value }) => handleUpdate(name, value, objectId)}
            mode='blur'
         />
      );
   }

   async function handleUpdate(name, value, objectId) {
      const payload = {
         [name]: value
      };

      try {
         await update({
            id: objectId,
            payload,
            table: definition.TableName,
            tableId: definition.Id
         }).unwrap();

         revalidator.revalidate();
         dispatch(updateDataObject({ id: objectId, properties: payload }));
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
      const toDelete = select.state.ids.filter(id => visibleTableRowsRef.current.includes(id));
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
            table: definition.TableName,
            tableId: definition.Id
         }).unwrap();

         setSelectedRows({ ids: [] });
         revalidator.revalidate();
         dispatch(deleteDataObjects(toDelete));
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
               <gn-button>
                  <button onClick={() => setEditMode(!editMode)} className={styles.edit}>{!editMode ? 'Rediger tabell' : 'Avslutt redigering'}</button>
               </gn-button>

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
                                             <Cell>{item.id}</Cell>
                                             {
                                                metadata.map(data => (
                                                   <Cell key={data.ColumnName}>
                                                      {
                                                         !editMode ?
                                                            renderProperty({ value: item[data.ColumnName], dataType: data.DataType }) :
                                                            renderFormControl(data.ColumnName, item[data.ColumnName], data.DataType, item.id)
                                                      }
                                                   </Cell>
                                                ))
                                             }
                                             <Cell stiff className={styles.checkboxCell}>
                                                {
                                                   editMode ?
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