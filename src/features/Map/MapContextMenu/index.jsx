import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMap } from "context/MapProvider";
import { useDataset } from "context/DatasetProvider";
import { initializeDataObject } from "store/slices/objectSlice";
import { ControlledMenu, MenuItem } from "@szhsin/react-menu";
import { point as createPoint } from "@turf/helpers";
import { GeometryType } from "context/MapProvider/helpers/constants";
import { createFeatureGeoJson } from "context/MapProvider/helpers/feature";
import styles from "./MapContextMenu.module.scss";

export default function MapContextMenu() {
   const { map } = useMap();
   const { activeDataaset } = useDataset();
   const activeDataset = activeDataaset;
   const definition = activeDataset?.definition;
   const metadata = definition?.ForvaltningsObjektPropertiesMetadata || [];
   const [open, setOpen] = useState(false);
   const menuData = useSelector((state) => state.map.mapContextMenuData);
   const user = useSelector((state) => state.app.user);
   const dispatch = useDispatch();

   useEffect(() => {
      let canAdd =
         user !== null &&
         (!definition ||
            definition?.Viewers === null ||
            !definition.Viewers.includes(user.organization) ||
            hasAccessByProperties);

      if (!canAdd) return;

      setOpen(menuData !== null);

      if (menuData !== null) map.once("movestart", () => setOpen(false));
   }, [
      // user,
      user?.organization,
      definition?.Viewers,
      // hasAccessByProperties,
      menuData,
      map,
   ]);

   function addPoint() {
      const geoJson = createFeatureGeoJson(activeDataaset.id, metadata);
      const point = createPoint(menuData.coordinates);

      geoJson.geometry = point.geometry;
      geoJson.properties._coordinates = menuData.lonLat;

      dispatch(initializeDataObject({ geoJson, type: GeometryType.Point }));
   }

   function addLineString() {
      const geoJson = createFeatureGeoJson(activeDataaset.id, metadata);

      dispatch(
         initializeDataObject({ geoJson, type: GeometryType.LineString })
      );
   }

   function addPolygon() {
      const geoJson = createFeatureGeoJson(activeDataaset.id, metadata);

      dispatch(initializeDataObject({ geoJson, type: GeometryType.Polygon }));
   }

   function hasAccessByProperties() {
      definition.ForvaltningsObjektPropertiesMetadata.forEach((prop) => {
         prop.AccessByProperties.forEach((access) => {
            if (access.Contributors.includes(user.organization)) {
               return true;
            }
         });
      });

      return false;
   }

   return (
      <ControlledMenu
         anchorPoint={menuData?.pixels}
         onClose={() => setOpen(false)}
         state={open ? "open" : "closed"}
         direction="right"
         viewScroll="close"
         className={styles.contextMenu}
      >
         <li className={styles.header}>Legg til i aktivt lag:</li>
         <MenuItem onClick={addPoint}>
            <span className={`${styles.addButton} ${styles.addPoint}`}>
               Punkt
            </span>
         </MenuItem>
         <MenuItem onClick={addLineString}>
            <span className={`${styles.addButton} ${styles.addLineString}`}>
               Linje
            </span>
         </MenuItem>
         <MenuItem onClick={addPolygon}>
            <span className={`${styles.addButton} ${styles.addPolygon}`}>
               Polygon
            </span>
         </MenuItem>
      </ControlledMenu>
   );
}
