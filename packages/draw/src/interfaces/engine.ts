import { RectangleClient, PointOfRectangle, Vector, PlaitBoard, Point, PlaitElement } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { PlaitGeometry } from './geometry';

export interface EngineExtraData {}

export interface ShapeEngine<
    T extends PlaitElement = PlaitGeometry,
    P extends EngineExtraData = EngineExtraData,
    K extends EngineExtraData = EngineExtraData
> {
    isInsidePoint: (rectangle: RectangleClient, point: Point) => boolean;
    getNearestPoint: (rectangle: RectangleClient, point: Point) => Point;
    getNearestCrossingPoint?: (rectangle: RectangleClient, point: Point) => Point;
    getConnectorPoints: (rectangle: RectangleClient) => Point[];
    getCornerPoints: (rectangle: RectangleClient) => Point[];
    getEdgeByConnectionPoint?: (rectangle: RectangleClient, point: PointOfRectangle) => [Point, Point] | null;
    getTangentVectorByConnectionPoint?: (rectangle: RectangleClient, point: PointOfRectangle) => Vector | null;
    draw: (board: PlaitBoard, rectangle: RectangleClient, roughOptions: Options, options?: P) => SVGGElement;
    getTextRectangle?: (element: T, options?: K) => RectangleClient;
}
