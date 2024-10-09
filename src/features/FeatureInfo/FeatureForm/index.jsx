import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useMap } from 'context/MapProvider';
import { useDataset } from 'context/DatasetProvider';
import { toggleEditor } from 'store/slices/geomEditorSlice';
import { getProperties, roundCoordinates, transformCoordinates, zoomToFeature } from 'utils/helpers/map';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { BooleanSelect, DatePicker, Select, TextField } from 'components/Form';
import { GeometryType } from 'context/MapProvider/helpers/constants';
import { toDbModel } from '../helpers';
import { Point } from 'ol/geom';
import { addCrosshairCursor, removeCrosshairCursor } from './helpers';
import environment from 'config/environment';
import styles from '../FeatureInfo.module.scss';

const LAT_LON_REGEX = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

const GEOMETRY_TYPES = {
   'Punkt': GeometryType.Point,
   'Linje': GeometryType.LineString,
   'Polygon': GeometryType.Polygon
};

export default function FeatureForm({ feature, onSave, onCancel, onDelete }) {
   const { map } = useMap();
   const { allowedValues } = useDataset();
   const { control, setValue, handleSubmit } = useForm({ defaultValues: getDefaultValues() });
   const coordinates = useWatch({ control, name: 'coordinates' });
   const geometryType = useWatch({ control, name: '_geometryType' });
   const properties = getProperties(feature.getProperties());
   const featureRef = useRef(feature.clone());
   const dispatch = useDispatch();

   const getCoordinate = useCallback(
      event => {
         const coords = event.coordinate;
         const transformed = transformCoordinates(environment.MAP_EPSG, `EPSG:${environment.DATASET_SRID}`, coords);
         const rounded = roundCoordinates(transformed);

         setValue('coordinates', `${rounded[1]}, ${rounded[0]}`);
         feature.set('_coordinates', rounded);

         const point = new Point(coords);
         feature.setGeometry(point);
      },
      [feature, setValue]
   );

   useEffect(
      () => {
         if (map === null) {
            return;
         }

         map.on('click', getCoordinate);
         addCrosshairCursor(map);

         return () => {
            map.un('click', getCoordinate);
            removeCrosshairCursor(map);
         }
      },
      [map, getCoordinate]
   );

   useEffect(
      () => {
         if (map === null) {
            return;
         }

         dispatch(toggleEditor(geometryType !== GeometryType.Point ? geometryType : null));

         if (geometryType !== GeometryType.Point) {
            map.un('click', getCoordinate);
            removeCrosshairCursor(map);
         } else {
            map.on('click', getCoordinate);
            addCrosshairCursor(map)
         }
      },
      [map, getCoordinate, geometryType, dispatch]
   );

   const geometryTypeOptions = useMemo(
      () => {
         return Object.entries(GEOMETRY_TYPES)
            .map(entry => ({ value: entry[1], label: entry[0] }));
      },
      []
   );

   function getGeometryType() {
      
   }

   function handleChange({ target: { name, value } }) {
      const prop = feature.get(name);
      const newValue = value !== '' ? value : null;

      feature.set(name, { ...prop, value: newValue });
   }

   function handleCoordinatesChange(event) {
      const value = event.target.value.trim();
      const isValid = LAT_LON_REGEX.test(value);

      if (!isValid) {
         return;
      }

      const [lat, lon] = value.split(',').map(value => parseFloat(value.trim()));
      const transformed = transformCoordinates(`EPSG:${environment.DATASET_SRID}`, environment.MAP_EPSG, [lon, lat]);

      getCoordinate({ coordinate: transformed });
   }

   function getDefaultValues() {
      const coordinates = feature.get('_coordinates') || null;
      const geometryType = feature.getGeometry().getType();

      return {
         _geometryType: geometryType,
         coordinates: coordinates !== null ? `${coordinates[1]}, ${coordinates[0]}` : ''
      };
   }

   function handleSave() {
      handleSubmit(() => {
         const payload = toDbModel(featureRef.current, feature);
         dispatch(toggleEditor(null));
         onSave(payload);
      })();
   }

   function handleCancel() {
      feature.setProperties(featureRef.current.getProperties());
      dispatch(toggleEditor(null));
      onCancel();
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

      const allowedValuesForProp = allowedValues[name];

      if (dataType === 'text' && allowedValuesForProp !== null) {
         if (!allowedValuesForProp.includes(value)) {
            handleChange({ target: { name, value: allowedValuesForProp[0] } });
         }

         const options = allowedValuesForProp.map(option => ({ value: option, label: option }));

         return (
            <div className={styles.formControl}>
               <Select
                  name={name}
                  value={value}
                  options={options}
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
               <div className={styles.row}>
                  <div className={styles.label}>Geometri:</div>
                  <div className={styles.value}>
                     <Controller
                        control={control}
                        name="_geometryType"
                        render={({ field }) => (
                           <Select
                              {...field}
                              options={geometryTypeOptions}
                              allowEmpty={false}
                           />
                        )}
                     />
                  </div>
               </div>
               {
                  coordinates && geometryType === 'Point' && (
                     <div className={styles.row}>
                        <div className={styles.label}>Posisjon:</div>
                        <div className={`${styles.value} ${styles.coordinates}`}>
                           <Controller
                              control={control}
                              name="coordinates"
                              rules={{
                                 validate: value => LAT_LON_REGEX.test(value.trim())
                              }}
                              render={({ field, fieldState: { error } }) => (
                                 <TextField
                                    {...field}
                                    error={error}
                                    errorMessage="Et gyldig koordinatpar må fylles ut"
                                    onChange={event => {
                                       field.onChange(event);
                                       handleCoordinatesChange(event);
                                    }}
                                 />
                              )}
                           />
                        </div>
                     </div>
                  )
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
                     <button onClick={handleCancel}>Avbryt</button>
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