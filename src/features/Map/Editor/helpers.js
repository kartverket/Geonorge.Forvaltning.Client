import DrawPolygon from './DrawPolygon';
import DrawPolygonHole from './DrawPolygonHole';
import ModifyGeometry from './ModifyGeometry';
import SelectGeometry from './SelectGeometry';
import DeleteGeometry from './DeleteGeometry';
import UndoRedo from './UndoRedo';

export function addInteractions(map) {
   SelectGeometry.addInteraction(map);
   DrawPolygon.addInteraction(map);
   DrawPolygonHole.addInteraction(map);
   ModifyGeometry.addInteraction(map);
   DeleteGeometry.addInteraction(map);
   UndoRedo.addInteraction(map);
}
