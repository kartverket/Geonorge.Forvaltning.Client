import { Select } from 'components/Form';
import styles from './Legend.module.scss';
import { useDataset } from 'context/DatasetProvider';
import { useMemo, useState } from 'react';
import colorsGenerator from 'colors-generator';

export default function Legend() {
   const { metadata } = useDataset();
   const [selectedProperty, setSelectedProperty] = useState('')
   const [legendList, setLegendList] = useState([]);

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

         setLegendList(items);
      } else {
         setLegendList([]);
      }
   }

   if (selectOptions.length <= 1) {
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