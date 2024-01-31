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
