import { Page, Text, Image, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { inPlaceSort } from 'fast-sort';
import { renderProperty } from 'utils/helpers/general';
import { getProperties } from 'utils/helpers/map';
import { convertDistance, convertDuration } from '../helpers';
import { useMemo } from 'react';
import dayjs from 'dayjs';

Font.register({ family: 'Open Sans', src: '/fonts/Open-Sans.ttf' });
Font.register({ family: 'Raleway', src: '/fonts/Raleway.ttf' });

export default function PdfExport({ featureCollection, images }) {
   const { start, destinations } = useMemo(
      () => {
         const _start = featureCollection.features.find(feature => feature.properties._type === 'start');
         const _destinations = featureCollection.features.filter(feature => feature.properties._type === 'destination');
         const routes = featureCollection.features.filter(feature => feature.properties._type === 'route');

         inPlaceSort(_destinations).by({
            asc: destination => {
               const route = routes.find(route => route.properties.destinationId === destination.properties.id.value);
               return route?.properties.distance || Number.MAX_VALUE;
            }
         });

         return {
            start: _start,
            destinations: _destinations
         };
      },
      [featureCollection]
   );

   function renderProperties(feature) {
      const properties = getProperties(feature.properties);

      return Object.entries(properties).map(entry => (
         <View key={entry[0]} style={styles.row}>
            <Text style={styles.label}>{entry[1].name}:</Text>
            <Text style={styles.value}>{renderProperty(entry[1])}</Text>
         </View>
      ));
   }

   function renderDestinations() {
      return destinations.map((destination, index) => (
         <View key={destination.properties.id.value} wrap={false} style={styles.object}>
            <Text style={styles.subTitle}>Treff {index + 1} av {destinations.length}:</Text>
            <View style={styles.separator}></View>
            {renderProperties(destination)}
            {renderRouteData(destination)}
            {renderMapImage(destination)}
         </View>
      ));
   }

   function renderRouteData(feature) {
      const featureId = feature.properties.id.value;
      const route = featureCollection.features.find(feature => feature.properties._type === 'route' && feature.properties.destinationId === featureId);

      return (
         <View style={styles.routeData}>
            <View style={styles.row}>
               <Text style={styles.label}>Avstand:</Text>
               <Text style={styles.value}>{convertDistance(route.properties.distance)}</Text>
            </View>
            <View style={styles.row}>
               <Text style={styles.label}>Est. kjøretid:</Text>
               <Text style={styles.value}>{convertDuration(route.properties.duration)}</Text>
            </View>
         </View>
      );
   }

   function renderMapImage(feature) {
      const result = images.find(img => img.value?.destinationId === feature.properties.id.value);

      return result && (
         <View style={styles.mapImage}>
            <Image src={result.value.image} />
         </View>
      );
   }

   return (
      <Document>
         <Page size="A4" style={styles.page}>
            <Text style={styles.header} fixed>
               Nettverksanalyse - {dayjs().format('DD.MM.YYYY [kl.] HH:mm:ss')}
            </Text>

            <Text style={styles.title}>Analyseresultat ({destinations.length} treff)</Text>

            <Text style={styles.subTitle}>Start:</Text>

            <View wrap={false} style={styles.object}>
               <View style={styles.separator}></View>
               {renderProperties(start)}
               <View style={[styles.separator, { marginTop: 3 }]}></View>
            </View>

            {renderDestinations()}

            <Text
               style={styles.footer}
               render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
               fixed
            />
         </Page>
      </Document>
   );
}

const styles = StyleSheet.create({
   page: {
      fontFamily: 'Open Sans',
      fontSize: 10,
      padding: '20mm 20mm 25mm 20mm',
      lineHeight: 1.5
   },
   section: {
      marginBottom: 0
   },
   title: {
      fontFamily: 'Raleway',
      fontSize: 30,
      marginBottom: 12
   },
   subTitle: {
      fontSize: 12,
      marginBottom: 3
   },
   object: {
      marginBottom: 18
   },
   row: {
      flexDirection: 'row',
      marginBottom: 3
   },
   label: {
      width: '33%'
   },
   value: {
      width: '67%'
   },
   routeData: {
      borderTop: '1px dashed #d8d8d8',
      borderBottom: '1px dashed #d8d8d8',
      marginTop: 3,
      marginBottom: 9,
      paddingTop: 6,
      paddingBottom: 3
   },
   mapImage: {
      marginBottom: 9,
      border: '1px solid #d8d8d8'
   },
   separator: {
      borderBottom: '1px solid #d8d8d8',
      marginBottom: 6
   },
   header: {
      top: -5,
      fontSize: 10,
      marginBottom: 20,
      textAlign: 'center',
      color: 'grey',
   },
   footer: {
      position: 'absolute',
      fontSize: 10,
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: 'grey'
   }
});