import { useCallback, useEffect, useRef } from 'react';
import { useMap } from 'context/MapProvider';
import { renderProperty } from 'utils/helpers/general';
import { getLayer, getProperties } from 'utils/helpers/map';
import styles from './FeatureTooltip.module.scss';

export default function FeatureTooltip() {
   const { map } = useMap();
   const tooltipRef = useRef(null);
   const currentFeatureRef = useRef(null);

   const displayFeatureInfo = useCallback(
      (pixel, target) => {
         let clusterFeature = null;

         if (!target.closest('.ol-control')) {
            clusterFeature = map.forEachFeatureAtPixel(pixel, feature => feature, { 
               layerFilter: layer => layer.get('id') === 'features' 
            });
         }

         const layer = getLayer(map, 'features');
         let feature;

         if (layer.get('_isCluster')) {
            const features = clusterFeature?.get('features') || [];
            feature = features.length === 1 ? features[0] : null;
         } else {
            feature = clusterFeature;
         }

         const tooltip = tooltipRef.current;

         if (feature) {
            const { id, ...properties } = getProperties(feature.getProperties());
            const values = Object.entries(properties).map(entry => [entry[1].name, renderProperty(entry[1])]);
            values.unshift(['ID', id.value]);

            const valueStr = values.map(value => `${value[0]}: ${value[1]}`).join(' | ');

            tooltip.style.left = pixel[0] + 'px';
            tooltip.style.top = pixel[1] + 'px';

            if (feature !== currentFeatureRef.current) {
               tooltip.style.visibility = 'visible';
               tooltip.textContent = valueStr;
            }
         } else {
            tooltip.style.visibility = 'hidden';
         }

         currentFeatureRef.current = feature;
      },
      [map]
   );

   useEffect(
      () => {
         if (map === null) {
            return;
         }

         map.on('pointermove', event => {
            const pixel = map.getEventPixel(event.originalEvent);
            displayFeatureInfo(pixel, event.originalEvent.target);
         });

         map.on('click', () => {
            tooltipRef.current.style.visibility = 'hidden';
         });
      },
      [map, displayFeatureInfo]
   );

   return (
      <div className={styles.featureInfo} ref={tooltipRef}></div>
   );
}