import { Style, Circle as CircleStyle, Fill, Text, Stroke } from 'ol/style';

export function clusterStyle(feature) {
   const count = feature.get('features').length;

   if (count > 1) {
      return [
         new Style({
            image: new CircleStyle({
               radius: 20,
               fill: new Fill({
                  color: '#3767c75e',
               }),
            })
         }),
         new Style({
            image: new CircleStyle({
               radius: 14,
               fill: new Fill({
                  color: '#3767c7',
               }),
            }),
            text: new Text({
               text: count.toString(),
               font: '10px "Open Sans"',
               fill: new Fill({
                  color: '#ffffff',
               })
            })
         })
      ];
   }

   return feature.get('features')[0].getStyle();
}

export function getFeatureStyle(radius, strokeWidth) {
   return [
      new Style({
         image: new CircleStyle({
            radius,
            fill: new Fill({
               color: '#3767c7'
            }),
            stroke: new Stroke({
               color: '#3767c75e',
               width: strokeWidth
            })
         })
      })
   ];
}

export function getSecondaryFeatureStyle(radius, strokeWidth) {
   return [
      new Style({
         image: new CircleStyle({
            radius,
            fill: new Fill({
               color: '#249446'
            }),
            stroke: new Stroke({
               color: '#2494465e',
               width: strokeWidth
            })
         })
      })
   ];
}

export function getSelectedFeatureStyle(radius, strokeWidth) {
   return [
      new Style({
         image: new CircleStyle({
            radius,
            fill: new Fill({
               color: '#fe5000'
            }),
            stroke: new Stroke({
               color: '#fe50005e',
               width: strokeWidth
            })
         })
      })
   ];
}