import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { ZoomToExtent } from 'ol/control';
import { useMap } from 'context/MapProvider';
import { selectFeature } from 'store/slices/mapSlice';
import { getFeatureById, getLayer, getVectorSource, hasFeatures, zoomToFeature } from 'utils/helpers/map';
import { setNextAndPreviousFeatureId } from 'context/MapProvider/helpers/feature';
import baseMap from 'config/map/baseMap';
import FeatureTooltip from './FeatureTooltip';
import styles from './MapView.module.scss';

export default function MapView() {
   const { map } = useMap();
   const { id, objId } = useParams();
   const location = useLocation();
   const mapElementRef = useRef(null);
   const selectedFeature = useSelector(state => state.map.selectedFeature);
   const dispatch = useDispatch();

   useEffect(
      () => {
         if (map === null) {
            return;
         }

         if (selectedFeature === null) {
            history.replaceState(null, document.title, `/datasett/${id}`);
            return;
         }

         const feature = getFeatureById(map, selectedFeature.id);

         setNextAndPreviousFeatureId(map, feature);
         //highlightFeature(map, feature);

         const route = `/datasett/${id}/objekt/${selectedFeature.id}`;
         history.replaceState(null, document.title, route);

         if (selectedFeature.zoom && feature.getGeometry() !== null) {
            zoomToFeature(map, feature);
         }
      },
      [selectedFeature, map, location.pathname, id]
   );

   useEffect(
      () => {
         if (map === null) {
            return;
         }

         map.setTarget(mapElementRef.current);

         const layer = getLayer(map, 'features');
         const source = getVectorSource(layer);
         const view = map.getView();
         let extent;

         if (hasFeatures(map)) {
            extent = source.getExtent();
         } else {
            extent = baseMap.extent;
         }
         
         map.addControl(new ZoomToExtent({ extent }));

         if (!isNaN(objId)) {
            dispatch(selectFeature({ id: parseInt(objId), zoom: true }));
         } else {
            view.fit(extent, map.getSize());
            view.setMaxZoom(baseMap.maxZoom);

            const currentZoom = view.getZoom();

            if (currentZoom > baseMap.maxZoom) {
               view.setZoom(baseMap.maxZoom);
            }
         }

         return () => {
            map.setTarget(null)
            map.dispose();
            dispatch(selectFeature(null));
         }
      },
      [map, dispatch, objId]
   );

   return (
      <div className={styles.mapContainer}>
         <div ref={mapElementRef} className={styles.map}></div>         
         <FeatureTooltip />
      </div>
   );
}