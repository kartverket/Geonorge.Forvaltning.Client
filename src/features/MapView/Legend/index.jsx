import { Select } from 'components/Form';
import styles from './Legend.module.scss';
import { useDataset } from 'context/DatasetProvider';
import { useMemo, useState } from 'react';
import colorsGenerator from 'colors-generator';
import { useMap } from 'context/MapProvider';
import { getLayer } from 'utils/helpers/map';
import { groupBy } from 'lodash';
import { createFeatureStyle } from 'context/MapProvider/helpers/style';
import { Cluster, Vector as VectorSource } from 'ol/source';

export default function Legend() {
   const { metadata } = useDataset();
   const [selectedProperty, setSelectedProperty] = useState('')
   const [legendList, setLegendList] = useState([]);
   const { map } = useMap();

   const selectOptions = useMemo(
      () => {
         const options = metadata
            .filter(property => property.AllowedValues !== null)
            .map(property => ({ value: property.ColumnName, label: property.Name }));

         options.unshift({ value: '', label: 'Velg egenskap' });

         return options;
      },
      [metadata]
   );

   function handleChange(event) {
      const value = event.target.value;
      setSelectedProperty(value);

      if (value !== '') {
         const properties = metadata.find(property => property.ColumnName === value);
         const colors = colorsGenerator.generate('#86bff2', properties.AllowedValues.length).get();
         const items = properties.AllowedValues.map((value, index) => ({ color: colors[index], text: value }));

         updateFeatures(items, value);
         setLegendList(items);
      } else {
         setLegendList([]);
      }


   }

   function updateFeatures(legendList, selectedProperty) {
      const vectorLayer = getLayer(map, 'features');
      let vectorSource = vectorLayer.getSource();

      if (vectorSource.get('id') === 'cluster-source') {
         vectorSource = vectorSource.getSource();
      }

      const features = vectorSource.getFeatures().map(feature => feature.clone());

      const grouped = groupBy(features, feature => {
         const props = feature.getProperties();
         return props[selectedProperty].value;
      })

      legendList.forEach(item => {
         const features = grouped[item.text];

         features.forEach(feature => {
            feature.setStyle(createFeatureStyle(item.color, `${item.color}5e`));
         });
      })

      const newVectorSource = new VectorSource({ features });

      if (vectorLayer.get('_isCluster')) {
         const disabled = vectorLayer.get('_disabledSource');
         vectorLayer.set('_disabledSource', newVectorSource);
      } else {
         const current = vectorLayer.getSource();
         current.dispose();

         const disabled = vectorLayer.get('_disabledSource');
         // debugger
         // disabled.clear();
         // disabled.addFeatures(features);
         // disabled.getSource().clear();
         // disabled.getSource().addFeatures(features);
         disabled.setSource(newVectorSource);
         vectorLayer.setSource(newVectorSource);
      }
   }

   if (selectOptions.length) {
      return null;
   }

   return (
      <div className={styles.legend}>
         <div className={styles.select}>
            <Select
               value={selectedProperty}
               options={selectOptions}
               onChange={handleChange}
               allowEmpty={false}
            />
         </div>
         <div className={styles.legendList}>
            {
               legendList.map(item => (
                  <div key={item.color} className={styles.item}>
                     <span className={styles.color} style={{ background: item.color }}></span>
                     <span className={styles.text}>{item.text}</span>
                  </div>
               ))
            }
         </div>
      </div>
   );
}