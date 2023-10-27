import { GeometryShape, ShapeEngine } from '../interfaces';
import { CommentEngine } from './comment';
import { CrossEngine } from './cross';
import { DiamondEngine } from './diamond';
import { EllipseEngine } from './ellipse';
import { HexagonEngine } from './hexagon';
import { LeftArrowEngine } from './left-arrow';
import { OctagonEngine } from './octagon';
import { ParallelogramEngine } from './parallelogram';
import { PentagonEngine } from './pentagon';
import { PentagonArrowEngine } from './pentagon-arrow';
import { ProcessArrowEngine } from './process-arrow';
import { RectangleEngine } from './rectangle';
import { RightArrowEngine } from './right-arrow';
import { RoundCommentEngine } from './round-comment';
import { RoundRectangleEngine } from './round-rectangle';
import { StarEngine } from './star';
import { TrapezoidEngine } from './trapezoid';
import { TriangleEngine } from './triangle';
import { TwoWayArrowEngine } from './two-way-arrow';

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
    [GeometryShape.rightArrow]: RightArrowEngine,
    [GeometryShape.cross]: CrossEngine,
    [GeometryShape.star]: StarEngine,
    [GeometryShape.pentagon]: PentagonEngine,
    [GeometryShape.hexagon]: HexagonEngine,
    [GeometryShape.octagon]: OctagonEngine,
    [GeometryShape.pentagonArrow]: PentagonArrowEngine,
    [GeometryShape.processArrow]: ProcessArrowEngine,
    [GeometryShape.twoWayArrow]: TwoWayArrowEngine,
    [GeometryShape.comment]: CommentEngine,
    [GeometryShape.roundComment]: RoundCommentEngine
};

export const getEngine = (shape: GeometryShape) => {
    return ShapeEngineMap[shape];
};
