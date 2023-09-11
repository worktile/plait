import { GeometryShape, ShapeEngine } from '../../interfaces';
import { DiamondEngine } from './diamond';
import { EllipseEngine } from './ellipse';
import { ParallelogramEngine } from './parallelogram';
import { RectangleEngine } from './rectangle';
import { RoundRectangleEngine } from './round-rectangle';

export const ShapeEngineMap: Record<GeometryShape, ShapeEngine> = {
    [GeometryShape.rectangle]: RectangleEngine,
    [GeometryShape.diamond]: DiamondEngine,
    [GeometryShape.ellipse]: EllipseEngine,
    [GeometryShape.parallelogram]: ParallelogramEngine,
    [GeometryShape.roundRectangle]: RoundRectangleEngine,
    [GeometryShape.text]: RectangleEngine
};

export const getEngine = (shape: GeometryShape) => {
    return ShapeEngineMap[shape];
};
