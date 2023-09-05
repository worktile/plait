export enum DrawPointerType {
    text = 'text',
    rectangle = 'rectangle',
    line = 'line',
    diamond = 'diamond',
    roundRectangle = 'roundRectangle',
    parallelogram = 'parallelogram',
    ellipse = 'ellipse'
}

export const GeometryPointer = [
    DrawPointerType.rectangle,
    DrawPointerType.text,
    DrawPointerType.diamond,
    DrawPointerType.ellipse,
    DrawPointerType.parallelogram,
    DrawPointerType.roundRectangle
];
