import dayjs from "dayjs";
import { isNil } from "lodash";
import { getFeatureById2, getLayer, getVectorSource } from "./map";
import { getLayerFeaturesId } from "context/MapProvider/helpers/utils";

export function renderProperty({ value, dataType }) {
   if (isNil(value)) {
      return "-";
   }

   if (dataType === "bool") {
      return value === true ? "Ja" : "Nei";
   }

   if (dataType === "timestamp") {
      return dayjs(value).format("DD.MM.YYYY [kl.] HH:mm");
   }

   return value;
}

export function deleteFeatures(datasetId, deletedDataObjects, map) {
   const layer = getLayer(map, getLayerFeaturesId(datasetId));
   const source = getVectorSource(layer);

   deletedDataObjects.forEach((id) => {
      const feature = getFeatureById2(map, datasetId, id);

      if (feature !== null) {
         source.removeFeature(feature);
      }
   });
}

export function updateDataObject(object, updatedDataObject) {
   const index = object.objects.findIndex(
      (object) => object.id === updatedDataObject.id
   );

   if (index === -1) {
      return object;
   }

   const props = getUpdatedProperties(updatedDataObject, object.objects[index]);

   return {
      ...object,
      objects: [
         ...object.objects.slice(0, index),
         {
            ...object.objects[index],
            ...props,
         },
         ...object.objects.slice(index + 1),
      ],
   };
}

export function deleteDataObjects(object, deletedDataObjects) {
   const objects = object.objects.filter(
      (obj) => !deletedDataObjects.includes(obj.id)
   );

   if (!objects.length) {
      return object;
   }

   return {
      ...object,
      objects,
   };
}

function getUpdatedProperties({ properties }, object) {
   const objectKeys = Object.keys(object);
   const update = {};

   Object.entries(properties)
      .filter((entry) => objectKeys.includes(entry[0]))
      .forEach((entry) => {
         if (entry[0] === "geometry") {
            update[entry[0]] = JSON.parse(entry[1]);
         } else {
            update[entry[0]] = entry[1];
         }
      });

   return update;
}

export function arraysAreEqual(a, b) {
   if (a.length !== b.length) {
      return false;
   }

   const sortedA = [...a].sort();
   const sortedB = [...b].sort();

   return sortedA.every((element, index) => element === sortedB[index]);
}

export function removeEmptyValues(object) {
   const entries = Object.entries(object).filter(
      ([, value]) => value !== "" || value !== null || value !== undefined
   );

   const clean = entries.map(([key, v]) => {
      const value =
         typeof v === "object" && v !== null ? removeEmptyValues(v) : v;
      return [key, value];
   });

   return Object.fromEntries(clean);
}

export function formatOrgNo(orgNo) {
   if (isNil(orgNo)) {
      return null;
   }

   const matches = orgNo.match(/.{1,3}/g);
   return matches.join(" ");
}
