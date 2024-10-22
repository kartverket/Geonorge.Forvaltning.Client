export function addCrosshairCursor(map) {
   map.getTargetElement().classList.add('selectCoordinate');
}

export function removeCrosshairCursor(map) {
   map.getTargetElement().classList.remove('selectCoordinate');
}