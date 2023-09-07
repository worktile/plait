import { GeometryShape, ShapeMethods } from '../../interfaces';
import { DiamondMethods } from './diamond';
import { EllipseMethods } from './ellipse';
import { ParallelogramMethods } from './parallelogram';
import { RectangleMethods } from './rectangle';
import { RoundRectangleMethods } from './round-rectangle';

export const ShapeMethodsMap: Record<GeometryShape, ShapeMethods> = {
    [GeometryShape.rectangle]: RectangleMethods,
    [GeometryShape.diamond]: DiamondMethods,
    [GeometryShape.ellipse]: EllipseMethods,
    [GeometryShape.parallelogram]: ParallelogramMethods,
    [GeometryShape.roundRectangle]: RoundRectangleMethods,
    [GeometryShape.text]: RoundRectangleMethods
};
