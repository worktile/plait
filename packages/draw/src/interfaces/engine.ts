import { RectangleClient, PointOfRectangle, Vector, PlaitBoard, PlaitElement, Point } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { PlaitGeometry } from './geometry';

export interface ShapeEngine {
    isInsidePoint: (rectangle: RectangleClient, point: Point) => boolean;
    getNearestPoint: (rectangle: RectangleClient, point: Point) => Point;
    getNearestCrossingPoint?: (rectangle: RectangleClient, point: Point) => Point;
    getConnectorPoints: (rectangle: RectangleClient) => Point[];
    getCornerPoints: (rectangle: RectangleClient) => Point[];
    getEdgeByConnectionPoint?: (rectangle: RectangleClient, point: PointOfRectangle) => [Point, Point] | null;
    getTangentVectorByConnectionPoint?: (rectangle: RectangleClient, point: PointOfRectangle) => Vector | null;
    draw: (board: PlaitBoard, rectangle: RectangleClient, options: Options, element?: PlaitElement) => SVGGElement;
    getTextRectangle?: (element: PlaitElement) => RectangleClient;
}
