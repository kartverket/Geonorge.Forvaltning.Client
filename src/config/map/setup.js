import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import projections from "./projections.json";

projections.forEach((projection) => {
   proj4.defs(projection.epsg, projection.projStr);
   proj4.defs(projection.uri, proj4.defs(projection.epsg));
});

register(proj4);
