import { Color } from 'context/MapProvider/helpers/constants';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { getLayer, getVectorSource } from 'utils/helpers/map';
import DrawPolygon from './DrawPolygon';
import DrawPolygonHole from './DrawPolygonHole';
import DrawLineString from './DrawLineString';
import ModifyGeometry from './ModifyGeometry';
import SelectGeometry from './SelectGeometry';
import DeleteGeometry from './DeleteGeometry';
import UndoRedo from './UndoRedo';

export function addInteractions(map) {
   SelectGeometry.addInteraction(map);
   DrawPolygon.addInteraction(map);
   DrawPolygonHole.addInteraction(map);
   DrawLineString.addInteraction(map);
   ModifyGeometry.addInteraction(map);
   DeleteGeometry.addInteraction(map);
   UndoRedo.addInteraction(map);
}

export function createModifyGeometryStyle() {
   return new Style({
      image: new CircleStyle({
         radius: 9,
         fill: new Fill({
            color: Color.SELECTED_FEATURE_COLOR
         })
      })
   });
}

export function createDrawLineStringStyle() {
   return [
      new Style({
         stroke: new Stroke({
            color: Color.SELECTED_FEATURE_COLOR,
            width: 3
         }),
         zIndex: 2
      }),
      new Style({
         image: new CircleStyle({
            radius: 8,
            fill: new Fill({
               color: Color.SELECTED_FEATURE_COLOR
            })
         })
      })
   ];
}

export function createDrawPolygonStyle() {
   return [
      new Style({
         stroke: new Stroke({
            color: Color.SELECTED_FEATURE_COLOR,
            width: 3
         }),
         zIndex: 2
      }),
      new Style({
         fill: new Fill({
            color: `${Color.SELECTED_FEATURE_COLOR}5e`
         })
      }),
      new Style({
         image: new CircleStyle({
            radius: 8,
            fill: new Fill({
               color: Color.SELECTED_FEATURE_COLOR
            })
         })
      })
   ];
}

export function createDrawPolygonHoleStyle() {
   return [
      new Style({
         stroke: new Stroke({
            color: Color.SELECTED_FEATURE_COLOR,
            width: 3
         }),
         zIndex: 2
      }),
      new Style({
         fill: new Fill({
            color: `${Color.SELECTED_FEATURE_COLOR}5e`
         })
      }),
      new Style({
         image: new CircleStyle({
            radius: 8,
            fill: new Fill({
               color: Color.SELECTED_FEATURE_COLOR
            })
         })
      })
   ];
}

export function getEditedFeature(map) {
   const vectorLayer = getLayer(map, 'features');
   const vectorSource = getVectorSource(vectorLayer);

   return vectorSource
      .getFeatures()
      .find(feature => feature.get('_editing') === true) || null;
}