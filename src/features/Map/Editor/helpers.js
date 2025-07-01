import { Color } from "context/MapProvider/helpers/constants";
import { Style, Circle as CircleStyle, Fill, Stroke } from "ol/style";
import { getEditLayer, getLayer } from "utils/helpers/map";
import DrawPolygon from "./DrawPolygon";
import DrawPolygonHole from "./DrawPolygonHole";
import DrawLineString from "./DrawLineString";
import ModifyGeometry from "./ModifyGeometry";
import SelectGeometry from "./SelectGeometry";
import UndoRedo from "./UndoRedo";

export function addInteractions(map) {
   SelectGeometry.addInteraction(map);
   DrawPolygon.addInteraction(map);
   DrawPolygonHole.addInteraction(map);
   DrawLineString.addInteraction(map);
   ModifyGeometry.addInteraction(map);
   UndoRedo.addInteraction(map);
}

export function createModifyGeometryStyle() {
   return new Style({
      image: new CircleStyle({
         radius: 9,
         fill: new Fill({
            color: Color.SELECTED_FEATURE_COLOR,
         }),
      }),
   });
}

export function createDrawLineStringStyle() {
   return [
      new Style({
         stroke: new Stroke({
            color: Color.SELECTED_FEATURE_COLOR,
            width: 3,
         }),
         zIndex: 2,
      }),
      new Style({
         image: new CircleStyle({
            radius: 8,
            fill: new Fill({
               color: Color.SELECTED_FEATURE_COLOR,
            }),
         }),
      }),
   ];
}

export function createDrawPolygonStyle() {
   return [
      new Style({
         stroke: new Stroke({
            color: Color.SELECTED_FEATURE_COLOR,
            width: 3,
         }),
         zIndex: 2,
      }),
      new Style({
         fill: new Fill({
            color: `${Color.SELECTED_FEATURE_COLOR}5e`,
         }),
      }),
      new Style({
         image: new CircleStyle({
            radius: 8,
            fill: new Fill({
               color: Color.SELECTED_FEATURE_COLOR,
            }),
         }),
      }),
   ];
}

export function createDrawPolygonHoleStyle() {
   return [
      new Style({
         stroke: new Stroke({
            color: Color.SELECTED_FEATURE_COLOR,
            width: 3,
         }),
         zIndex: 2,
      }),
      new Style({
         fill: new Fill({
            color: `${Color.SELECTED_FEATURE_COLOR}5e`,
         }),
      }),
      new Style({
         image: new CircleStyle({
            radius: 8,
            fill: new Fill({
               color: Color.SELECTED_FEATURE_COLOR,
            }),
         }),
      }),
   ];
}

export function createSelectGeometryStyle() {
   return [
      new Style({
         stroke: new Stroke({
            color: Color.SELECTED_FEATURE_COLOR,
            width: 3,
         }),
         zIndex: 2,
      }),
      new Style({
         stroke: new Stroke({
            color: "#ffffff",
            width: 8,
         }),
      }),
      new Style({
         fill: new Fill({
            color: `${Color.SELECTED_FEATURE_COLOR}5e`,
         }),
      }),
   ];
}

export function getEditedFeature(map) {
   const vectorLayer = getEditLayer(map);
   const vectorSource = vectorLayer.getSource();

   return vectorSource.getFeatures()[0] || null;
}
