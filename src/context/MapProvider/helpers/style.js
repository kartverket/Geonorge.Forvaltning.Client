import { isNil } from "lodash";
import { Style, Circle as CircleStyle, Fill, Text, Stroke } from "ol/style";
import { Color, GeometryType } from "./constants";
import store from "store";

export function clusterStyle(feature) {
   const features = feature.get("features");

   if (features === undefined) {
      return featureStyle(feature);
   }

   const count = features.length;

   if (count > 1) {
      return createClusterStyle(count);
   }

   return featureStyle(features[0]);
}

export function featureStyle(feature) {
   const geomType = feature.getGeometry().getType();
   const styling = store.getState().map.styling;

   const tag = feature.get("_tag");
   let property = null;
   if (styling !== null) property = feature.getProperties()[styling.property];
   const value = property?.value !== undefined ? property.value : tag;

   let color;
   let textValue;
   let textColor;

   if (!isNil(value) && styling !== null && styling.legend !== null) {
      color = styling.legend[value];
      textValue = value[0].toUpperCase();
      textColor = "#000000";
   } else {
      color = "#333333";
      textValue = "?";
      textColor = "#ffffff";
   }

   const text = {
      value: textValue,
      color: textColor,
   };

   if (feature.get("_visible") === false) {
      return null;
   }

   if (feature.get("_selected") === true) {
      return createFeatureStyle(geomType, {
         color1: Color.SELECTED_FEATURE_COLOR,
         color2: `${Color.SELECTED_FEATURE_COLOR}5e`,
      });
   }

   if (feature.get("_featureType") === "analysis") {
      return createFeatureStyle(geomType, {
         color1: Color.ANALYSIS_FEATURE_COLOR,
         color2: `${Color.ANALYSIS_FEATURE_COLOR}5e`,
      });
   }

   if (styling === null) {
      return createFeatureStyle(geomType, {
         color1: Color.DEFAULT_FEATURE_COLOR,
         color2: `${Color.DEFAULT_FEATURE_COLOR}5e`,
      });
   }

   return createFeatureStyle(geomType, {
      color1: color,
      color2: `${color}5e`,
      text: text,
   });
}

export function createFeatureStyle(geomType, options) {
   switch (geomType) {
      case GeometryType.Point:
         return createPointFeatureStyle(options);
      case GeometryType.LineString:
      case GeometryType.MultiLineString:
         return createLineStringFeatureStyle(options);
      case GeometryType.Polygon:
      case GeometryType.MultiPolygon:
         return createPolygonFeatureStyle(options);
      default:
         return createPointFeatureStyle(options);
   }
}

export function createPointFeatureStyle({
   color1,
   color2,
   text = {},
   zIndex = 1,
}) {
   const style = new Style({
      image: new CircleStyle({
         radius: 9,
         fill: new Fill({
            color: color1,
         }),
         stroke: new Stroke({
            color: color2,
            width: 10,
         }),
      }),
      zIndex,
   });

   if (text.value !== "") {
      style.setText(createText(text));
   }

   return style;
}

export function createLineStringFeatureStyle({ color1, color2, zIndex = 1 }) {
   return [
      new Style({
         stroke: new Stroke({
            color: color1,
            width: 4,
         }),
         zIndex,
      }),
      new Style({
         image: new CircleStyle({
            radius: 9,
            fill: new Fill({
               color: color1,
            }),
            stroke: new Stroke({
               color: color2,
               width: 10,
            }),
         }),
         zIndex,
      }),
   ];
}

export function createPolygonFeatureStyle({ color1, color2, zIndex = 1 }) {
   return [
      new Style({
         stroke: new Stroke({
            color: color1,
            width: 4,
         }),
         zIndex,
      }),
      new Style({
         fill: new Fill({
            color: color2,
         }),
      }),
      new Style({
         image: new CircleStyle({
            radius: 9,
            fill: new Fill({
               color: color1,
            }),
            stroke: new Stroke({
               color: color2,
               width: 10,
            }),
         }),
         zIndex,
      }),
   ];
}

function createClusterStyle(count) {
   return [
      new Style({
         image: new CircleStyle({
            radius: 20,
            fill: new Fill({
               color: `${Color.DEFAULT_FEATURE_COLOR}5e`,
            }),
         }),
      }),
      new Style({
         image: new CircleStyle({
            radius: 14,
            fill: new Fill({
               color: Color.DEFAULT_FEATURE_COLOR,
            }),
         }),
         text: createText({
            value: count.toString(),
            color: Color.CLUSTER_FONT_COLOR,
         }),
      }),
   ];
}

function createText({ value, font, color }) {
   return new Text({
      text: value,
      font: font || '10px "Open Sans"',
      fill: new Fill({
         color: color || "#000000",
      }),
   });
}
