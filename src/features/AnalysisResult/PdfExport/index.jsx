import { Page, Text, Image, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { renderProperty } from 'utils/helpers/general';
import { getProperties } from 'utils/helpers/map';
import { convertDistance, convertDuration } from '../helpers';

Font.register({ family: 'Open Sans', src: '/fonts/Open-Sans.ttf' });
Font.register({ family: 'Raleway', src: '/fonts/Raleway.ttf' });

export default function PdfExport({ featureCollection, images }) {
   const start = featureCollection.features.find(feature => feature.properties._type === 'start');
   const destinations = featureCollection.features.filter(feature => feature.properties._type === 'destination');

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
      return destinations.map(destination => (
         <View key={destination.properties.id.value} wrap={false} style={styles.object}>
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
      const { image } = images.find(img => img.destinationId === feature.properties.id.value);

      return (
         <View style={styles.mapImage}>
            <Image src={image} />
         </View>
      );
   }

   return (
      <Document>
         <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Analyseresultat</Text>

            <Text style={styles.subTitle}>Start</Text>

            <View wrap={false} style={styles.object}>
               <View style={styles.separator}></View>
               {renderProperties(start)}
               <View style={[styles.separator, { marginTop: 3 }]}></View>
            </View>

            <Text style={styles.subTitle}>Destinasjoner ({destinations.length})</Text>
            {renderDestinations()}

            <Text
               style={styles.pageNumber}
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
   pageNumber: {
      position: 'absolute',
      fontSize: 10,
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: 'grey'
   }
});