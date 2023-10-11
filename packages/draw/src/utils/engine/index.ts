import { GeometryShape, ShapeEngine } from '../../interfaces';
import { DiamondEngine } from './diamond';
import { EllipseEngine } from './ellipse';
import { LeftArrowEngine } from './left-arrow';
import { ParallelogramEngine } from './parallelogram';
import { RectangleEngine } from './rectangle';
import { RightArrowEngine } from './right-arrow';
import { RoundRectangleEngine } from './round-rectangle';
import { TrapezoidEngine } from './trapezoid';
import { TriangleEngine } from './triangle';

export const ShapeEngineMap: Record<GeometryShape, ShapeEngine> = {
    [GeometryShape.rectangle]: RectangleEngine,
    [GeometryShape.diamond]: DiamondEngine,
    [GeometryShape.ellipse]: EllipseEngine,
    [GeometryShape.parallelogram]: ParallelogramEngine,
    [GeometryShape.roundRectangle]: RoundRectangleEngine,
    [GeometryShape.text]: RectangleEngine,
    [GeometryShape.triangle]: TriangleEngine,
    [GeometryShape.leftArrow]: LeftArrowEngine,
    [GeometryShape.trapezoid]: TrapezoidEngine,
    [GeometryShape.rightArrow]: RightArrowEngine
};

export const getEngine = (shape: GeometryShape) => {
    return ShapeEngineMap[shape];
};
