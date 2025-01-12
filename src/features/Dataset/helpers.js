import colorsGenerator from 'colors-generator';

export function generateColors() {
    const colors = colorsGenerator.generate('#86bff2', 10).darker(0.2).get();
    
    return new Map(colors.map(color => [color, null]));
}