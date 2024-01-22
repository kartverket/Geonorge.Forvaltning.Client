import { useCallback, useEffect, useState } from 'react';
import { useMap } from 'context/MapProvider';
import { useDataset } from 'context/DatasetProvider';
import { getProperties, transformCoordinates, zoomToFeature } from 'utils/helpers/map';
import { BooleanSelect, DatePicker, Select, TextField } from 'components/Form';
import { Point } from 'ol/geom';
import environment from 'config/environment';
import styles from '../FeatureInfo.module.scss';

export default function FeatureForm({ feature, onSave, onCancel, onDelete }) {
   const { map } = useMap();
   const { allowedValues } = useDataset();
   const [coordinates, setCoordinates] = useState(feature.get('_coordinates') || null);
   const properties = getProperties(feature);

   const getCoordinate = useCallback(
      event => {
         const coords = event.coordinate;

         const transformed = transformCoordinates(environment.MAP_EPSG, `EPSG:${environment.DATASET_SRID}`, coords);
         setCoordinates(transformed);
         feature.set('_coordinates', transformed);

         const point = new Point(coords);
         feature.setGeometry(point);         
      },
      [feature]
   );

   useEffect(
      () => {
         if (map === null) {
            return;
         }

         map.on('click', getCoordinate);
         map.getTargetElement().classList.add('selectCoordinate');

         return () => {
            map.un('click', getCoordinate);
            map.getTargetElement()?.classList.remove('selectCoordinate');
         }
      },
      [map, getCoordinate]
   );

   function handleChange({ name, value }) {
      const prop = feature.get(name);
      feature.set(name, { ...prop, value });
   }

   function handleSave() {
      onSave();
   }

   function handleDelete() {
      onDelete(properties.id.value);
   }

   function zoomToObject() {
      zoomToFeature(map, feature);
   }

   function renderFormControl(name, { value, dataType }) {
      if (dataType === 'bool') {
         return (
            <div className={styles.formControl}>
               <BooleanSelect
                  name={name}
                  value={value}
                  onChange={handleChange}
               />
            </div>
         );
      }

      const selectOptions = allowedValues[name];

      if (dataType === 'text' && selectOptions !== null) {
         if (!selectOptions.includes(value)) {
            handleChange({ name, value: selectOptions[0] });
         }

         return (
            <div className={styles.formControl}>
               <Select
                  name={name}
                  value={value}
                  options={selectOptions}
                  onChange={handleChange}
                  allowEmpty={false}
               />
            </div>
         );
      }

      if (dataType === 'timestamp') {
         return (
            <div className={styles.formControl}>
               <DatePicker
                  name={name}
                  value={value}
                  onChange={handleChange}
               />
            </div>
         );
      }

      return (
         <div className={styles.formControl}>
            <TextField
               key={value}
               name={name}
               value={value}
               onChange={handleChange}
            />
         </div>
      );
   }

   return (
      <>
         <div className={styles.buttonsTop}>
            <gn-button>
               <button
                  onClick={zoomToObject}
                  disabled={coordinates === null}
                  className={styles.zoom}
               >
                  Gå til
               </button>
            </gn-button>
         </div>

         <div className={styles.form}>
            <div>
               <div className={styles.row}>
                  <div className={styles.label}>ID:</div>
                  <div className={styles.value}>
                     <div className={styles.noInput}>{properties.id.value || '-'}</div>
                  </div>
               </div>
               {
                  Object.entries(properties)
                     .filter(entry => entry[0] !== 'id')
                     .map(entry => (
                        <div key={entry[0]} className={styles.row}>
                           <div className={styles.label}>{entry[1].name}:</div>
                           <div className={styles.value}>
                              {renderFormControl(entry[0], entry[1])}
                           </div>
                        </div>
                     ))
               }
               {
                  coordinates ?
                     <div className={styles.row}>
                        <div className={styles.label}>Posisjon:</div>
                        <div className={styles.value}>
                           <div className={styles.noInput} title={coordinates.join(', ')}>{coordinates[1].toFixed(6)}, {coordinates[0].toFixed(6)}</div>
                        </div>
                     </div> :
                     null
               }
            </div>

            <div className={styles.buttonsBottom}>
               <div style={{ visibility: properties.id.value ? 'visible' : 'hidden' }}>
                  <gn-button color="danger">
                     <button onClick={handleDelete}>Slett...</button>
                  </gn-button>
               </div>
               <div>
                  <gn-button>
                     <button onClick={onCancel}>Avbryt</button>
                  </gn-button>
                  <gn-button color="primary">
                     <button onClick={handleSave} disabled={coordinates === null}>Lagre</button>
                  </gn-button>
               </div>
            </div>
         </div>
      </>
   );
}