import { RectangleClient, PointOfRectangle, Vector, PlaitBoard, Point, PlaitElement } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { PlaitGeometry } from './geometry';

export interface DrawOptions {
    element: PlaitElement;
}

export interface TextRectangleOptions {
    id: string;
    board?: PlaitBoard;
}

export interface ShapeEngine<
    T extends PlaitElement = PlaitGeometry,
    P extends DrawOptions = DrawOptions,
    K extends TextRectangleOptions = TextRectangleOptions
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
