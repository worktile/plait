import { BasicShapes, FlowchartSymbols, GeometryShapes, ShapeEngine } from '../interfaces';
import { CommentEngine } from './basic-shapes/comment';
import { CrossEngine } from './basic-shapes/cross';
import { DiamondEngine } from './basic-shapes/diamond';
import { EllipseEngine } from './basic-shapes/ellipse';
import { HexagonEngine } from './basic-shapes/hexagon';
import { LeftArrowEngine } from './basic-shapes/left-arrow';
import { OctagonEngine } from './basic-shapes/octagon';
import { ParallelogramEngine } from './basic-shapes/parallelogram';
import { PentagonEngine } from './basic-shapes/pentagon';
import { PentagonArrowEngine } from './basic-shapes/pentagon-arrow';
import { ProcessArrowEngine } from './basic-shapes/process-arrow';
import { RectangleEngine } from './basic-shapes/rectangle';
import { RightArrowEngine } from './basic-shapes/right-arrow';
import { RoundCommentEngine } from './basic-shapes/round-comment';
import { RoundRectangleEngine } from './basic-shapes/round-rectangle';
import { TrapezoidEngine } from './basic-shapes/trapezoid';
import { TriangleEngine } from './basic-shapes/triangle';
import { TwoWayArrowEngine } from './basic-shapes/two-way-arrow';
import { StarEngine } from './basic-shapes/star';

export const ShapeEngineMap: Record<GeometryShapes, ShapeEngine> = {
    [BasicShapes.rectangle]: RectangleEngine,
    [BasicShapes.diamond]: DiamondEngine,
    [BasicShapes.ellipse]: EllipseEngine,
    [BasicShapes.parallelogram]: ParallelogramEngine,
    [BasicShapes.roundRectangle]: RoundRectangleEngine,
    [BasicShapes.text]: RectangleEngine,
    [BasicShapes.triangle]: TriangleEngine,
    [BasicShapes.leftArrow]: LeftArrowEngine,
    [BasicShapes.trapezoid]: TrapezoidEngine,
    [BasicShapes.rightArrow]: RightArrowEngine,
    [BasicShapes.cross]: CrossEngine,
    [BasicShapes.star]: StarEngine,
    [BasicShapes.pentagon]: PentagonEngine,
    [BasicShapes.hexagon]: HexagonEngine,
    [BasicShapes.octagon]: OctagonEngine,
    [BasicShapes.pentagonArrow]: PentagonArrowEngine,
    [BasicShapes.processArrow]: ProcessArrowEngine,
    [BasicShapes.twoWayArrow]: TwoWayArrowEngine,
    [BasicShapes.comment]: CommentEngine,
    [BasicShapes.roundComment]: RoundCommentEngine,
    [FlowchartSymbols.process]: RectangleEngine
};

export const getEngine = (shape: GeometryShapes) => {
    return ShapeEngineMap[shape];
};
