import { isNil } from 'lodash';
import { Style, Circle as CircleStyle, Fill, Text, Stroke } from 'ol/style';
import store from 'store';

const DEFAULT_FEATURE_COLOR = '#3767c7';
const SELECTED_FEATURE_COLOR = '#fe5000';
const ANALYSIS_FEATURE_COLOR = '#249446';
const CLUSTER_FONT_COLOR = '#ffffff';

export function clusterStyle(feature) {
   const features = feature.get('features');
   const count = features.length;
   
   if (count > 1) {
      return createClusterStyle(count);
   }

   return featureStyle(features[0]);
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

   let color;
   let textValue; 
   let textColor;
   
   if (!isNil(value)) {
      color = styling.legend[value];
      textValue = value[0].toUpperCase();
      textColor = '#000000';
   } else {
      color = '#333333';
      textValue = '?';
      textColor = '#ffffff';
   }

   const text = {
      value: textValue,
      color: textColor
   };

   return createFeatureStyle(color, `${color}5e`, text);
}

export function createFeatureStyle(fillColor, strokeColor, text = {}, zIndex = 1) {
   const style = new Style({
      image: new CircleStyle({
         radius: 9,
         fill: new Fill({
            color: fillColor
         }),
         stroke: new Stroke({
            color: strokeColor,
            width: 10
         })
      }),
      zIndex
   });

   if (text.value !== '') {
      style.setText(createText(text));
   }

   return style;
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
         text: createText({ 
            value: count.toString(), 
            color: CLUSTER_FONT_COLOR 
         })
      })
   ];
}

function createText({ value, font, color }) {
   return new Text({
      text: value,
      font: font || '10px "Open Sans"',
      fill: new Fill({
         color: color || '#000000'
      })
   })
}
