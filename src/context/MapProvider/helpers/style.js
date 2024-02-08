import { Style, Circle as CircleStyle, Fill, Text, Stroke } from 'ol/style';
import store from 'store';

const DEFAULT_FEATURE_COLOR = '#3767c7';
const SELECTED_FEATURE_COLOR = '#fe5000';
const ANALYSIS_FEATURE_COLOR = '#249446';
const FONT_COLOR = '#ffffff';

export function clusterStyle(feature) {
   const count = feature.get('features').length;

   if (count > 1) {
      return createClusterStyle(count);
   }

   return featureStyle(feature.get('features')[0]);
}

export function featureStyle(feature) {
   if (feature.get('_visible') === false) {
      return null;
   }
   
   if (feature.get('_selected') === true) {
      return createFeatureStyle(SELECTED_FEATURE_COLOR, `${SELECTED_FEATURE_COLOR}5e`);
   }

   if (feature.get('_featureType') === 'analysis') {
      return createFeatureStyle(ANALYSIS_FEATURE_COLOR, `${ANALYSIS_FEATURE_COLOR}5e`);
   }

   const styling = store.getState().map.styling;

   if (styling === null) {
      return createFeatureStyle(DEFAULT_FEATURE_COLOR, `${DEFAULT_FEATURE_COLOR}5e`);
   }

   const property = feature.getProperties()[styling.property];
   const value = property.value;
   const color = styling.legend[value];

   return createFeatureStyle(color, `${color}5e`);
}

export function createFeatureStyle(fillColor, strokeColor, zIndex = 1) {
   return [
      new Style({
         image: new CircleStyle({
            radius: 7,
            fill: new Fill({
               color: fillColor
            }),
            stroke: new Stroke({
               color: strokeColor,
               width: 8
            })
         }),
         zIndex
      })
   ];
}

function createClusterStyle(count) {
   return [
      new Style({
         image: new CircleStyle({
            radius: 20,
            fill: new Fill({
               color: `${DEFAULT_FEATURE_COLOR}5e`
            }),
         })
      }),
      new Style({
         image: new CircleStyle({
            radius: 14,
            fill: new Fill({
               color: DEFAULT_FEATURE_COLOR
            }),
         }),
         text: new Text({
            text: count.toString(),
            font: '10px "Open Sans"',
            fill: new Fill({
               color: FONT_COLOR
            })
         })
      })
   ];
}
