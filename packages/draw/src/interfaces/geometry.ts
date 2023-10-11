import { PlaitBoard, PlaitElement, Point, PointOfRectangle, RectangleClient } from '@plait/core';
import { GeometryComponent } from '../geometry.component';
import { Options } from 'roughjs/bin/core';
import { ParagraphElement } from '@plait/text';
import { StrokeStyle } from './element';

export enum GeometryShape {
    rectangle = 'rectangle',
    ellipse = 'ellipse',
    diamond = 'diamond',
    roundRectangle = 'roundRectangle',
    parallelogram = 'parallelogram',
    text = 'text'
}

export interface PlaitGeometry extends PlaitElement {
    points: [Point, Point];
    type: 'geometry';
    shape: GeometryShape;

    text: ParagraphElement;
    textHeight: number;

    // node style attributes
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: StrokeStyle;

    angle: number;
    opacity: number;
}

export interface PlaitRectangle extends PlaitGeometry {
    shape: GeometryShape.rectangle;
}

export interface PlaitEllipse extends PlaitGeometry {
    shape: GeometryShape.ellipse;
}

export interface PlaitDiamond extends PlaitGeometry {
    shape: GeometryShape.diamond;
}

export const PlaitGeometry = {
    getTextEditor(element: PlaitGeometry) {
        return PlaitGeometry.getTextManage(element).componentRef.instance.editor;
    },
    getTextManage(element: PlaitGeometry) {
        const component = PlaitElement.getComponent(element) as GeometryComponent;
        if (component) {
            return component.textManage;
        }
        throw new Error('can not get correctly component in get text editor');
    }
};

export interface ShapeEngine {
    isHit: (rectangle: RectangleClient, point: Point) => boolean;
    getNearestPoint: (rectangle: RectangleClient, point: Point) => Point;
    getConnectorPoints: (rectangle: RectangleClient) => Point[];
    getCornerPoints: (rectangle: RectangleClient) => Point[];
    getEdgeByConnectionPoint?: (rectangle: RectangleClient, point: PointOfRectangle) => [Point, Point] | null;
    draw: (board: PlaitBoard, rectangle: RectangleClient, options: Options) => SVGGElement;
}
