import { RectangleClient, PointOfRectangle, Vector, PlaitBoard, Point } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { PlaitGeometry } from './geometry';

export interface BaseEngine {
    isInsidePoint: (rectangle: RectangleClient, point: Point) => boolean;
    getNearestPoint: (rectangle: RectangleClient, point: Point) => Point;
    getNearestCrossingPoint?: (rectangle: RectangleClient, point: Point) => Point;
    getConnectorPoints: (rectangle: RectangleClient) => Point[];
    getCornerPoints: (rectangle: RectangleClient) => Point[];
    getEdgeByConnectionPoint?: (rectangle: RectangleClient, point: PointOfRectangle) => [Point, Point] | null;
    getTangentVectorByConnectionPoint?: (rectangle: RectangleClient, point: PointOfRectangle) => Vector | null;
}

export interface ShapeEngine extends BaseEngine {
    draw: (board: PlaitBoard, rectangle: RectangleClient, options: Options) => SVGGElement;
    getTextRectangle?: (element: PlaitGeometry) => RectangleClient;
}

