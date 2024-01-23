import dayjs from 'dayjs';
import WKT from 'ol/format/WKT';
import { Point } from 'ol/geom';
import { isUndefined, orderBy } from 'lodash';
import { roundCoordinates, writeGeoJson } from 'utils/helpers/map';
import environment from 'config/environment';

const WKT_REGEX = /^POINT\s?\(-?\d+(\.\d+)?\s-?\d+(\.\d+)?\)$/;
const COORDINATE_REGEX = /^-?\d+(\.\d+)?$/;

export function mapCsvToObjects(csv, geomColumns, mappings, importSrId, user) {
   const ownerOrg = user.organization;
   const editor = user.email;
   const updateDate = dayjs().format();
   const errors = [];
   let options = null;

   if (importSrId !== environment.DATASET_SRID) {
      options = {
         srcProjection: `EPSG:${importSrId}`,
         destProjection: `EPSG:${environment.DATASET_SRID}`
      }
   }

   const objects = csv
      .map(row => {
         let geometry = null;

         try {
            if (geomColumns.xy) {
               geometry = createGeometryFromXY(row, geomColumns.xy, options);
            } else if (geomColumns.wkt) {
               geometry = createGeometryFromWkt(row, geomColumns.wkt, options);
            }
         } catch (error) {
            errors.push(error.message);
            return null;
         }

         const object = {
            geometry,
            'owner_org': ownerOrg,
            editor: editor,
            updatedate: updateDate
         };

         Object.entries(mappings)
            .forEach(entry => {
               const prop = row[entry[1]];
               object[entry[0]] = !isUndefined(prop) ? prop : null;
            });

         return object;
      })
      .filter(object => object !== null);

   return {
      objects,
      errors
   };
}

function createGeometryFromXY(row, columnNames, options) {
   const [colX, colY] = columnNames;
   const x = parseFloat(row[colX]);
   const y = parseFloat(row[colY]);

   if (!isCoordinate(x) || !isCoordinate(y)) {
      throw new Error('Ugyldige koordinater');
   }

   const geometry = new Point([x, y]);

   if (options !== null) {
      geometry.transform(options.srcProjection, options.destProjection);
   }

   const geoJson = JSON.parse(writeGeoJson(geometry));

   geoJson.coordinates = roundCoordinates(geoJson.coordinates);
   
   return JSON.stringify(geoJson);
}

function createGeometryFromWkt(row, columnNames, options) {
   const [colWkt] = columnNames;   
   const wkt = row[colWkt];
   
   if (!isWktPoint(wkt)) {
      throw new Error('Ugyldig WKT-geometri');
   }

   const format = new WKT();
   let wktOptions = {};

   if (options !== null) {
      wktOptions.dataProjection = options.srcProjection,
      wktOptions.featureProjection = options.destProjection
   }

   const geometry = format.readGeometry(wkt, wktOptions);

   if (geometry.getType() !== 'Point') {
      throw new Error('Geometrien er ikke et punkt');
   }

   const geoJson = JSON.parse(writeGeoJson(geometry));

   geoJson.coordinates = roundCoordinates(geoJson.coordinates);
   
   return JSON.stringify(geoJson);
}

export function detectGeometryColumns(rows) {
   const firstRows = rows.slice(0, 5);

   for (let i = 0; i < firstRows.length; i++) {
      const row = firstRows[i];
      const entries = Object.entries(row);
      const wktColumn = entries.find(entry => isWktPoint(entry[1]));

      if (wktColumn) {
         return { wkt: [wktColumn[0]] };
      } else {
         const xyColumns = orderBy(entries.filter(entry => ['x', 'y'].includes(entry[0].toLowerCase())), entry => entry[0]);

         if (xyColumns.length === 2 && isCoordinate(xyColumns[0][1]) && isCoordinate(xyColumns[1][1])) {
            return { xy: [xyColumns[0][0], xyColumns[1][0]] };
         }
      }
   }

   return null;
}

function isWktPoint(value) {
   return WKT_REGEX.test(value);
}

function isCoordinate(value) {
   return COORDINATE_REGEX.test(value);
}