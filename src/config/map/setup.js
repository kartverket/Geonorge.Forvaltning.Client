import proj4 from 'proj4';
import { get as getProjection } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import projections from './projections.json';

projections.forEach(projection => {
   proj4.defs(projection.epsg, projection.projStr);
   proj4.defs(projection.uri, proj4.defs(projection.epsg));
});

register(proj4);

const proj25832 = getProjection('EPSG:25832');
proj25832.setExtent([-2000000, 3500000, 3545984, 9045984]);

const proj25833 = getProjection('EPSG:25833');
proj25833.setExtent([-2500000, 3500000, 3045984, 9045984]);

const proj25835 = getProjection('EPSG:25835');
proj25835.setExtent([-3500000, 3500000, 2045984, 9045984]);

const proj5972 = getProjection('EPSG:5972');
proj5972.setExtent([-2000000, 3500000, 3545984, 9045984]);

const proj5973 = getProjection('EPSG:5973');
proj5973.setExtent([-2500000, 3500000, 3045984, 9045984]);

const proj5975 = getProjection('EPSG:5975');
proj5975.setExtent([-3500000, 3500000, 2045984, 9045984]);

const proj4326 = getProjection('EPSG:4326');
proj4326.setExtent([-2.56007, 57.0881, 33.0201, 71.8912]);