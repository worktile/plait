import { PlaitBoard, PlaitElement, Point, RectangleClient } from '@plait/core';
import { Element } from 'slate';
import { GeometryComponent } from '../geometry.component';
import { Options } from 'roughjs/bin/core';

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

    text: Element;
    textHeight: number;

    // node style attributes
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;

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
        const component = PlaitElement.getComponent(element) as GeometryComponent;
        if (component) {
            return component.textManage.componentRef.instance.editor;
        }
        throw new Error('can not get correctly component in get text editor');
    }
};

export interface ShapeMethods {
    isHit: (rectangle: RectangleClient, point: Point) => boolean;
    getNearestPoint: (rectangle: RectangleClient, point: Point) => Point;
    getConnectorPoints: (rectangle: RectangleClient) => Point[];
    draw: (board: PlaitBoard, rectangle: RectangleClient, options: Options) => SVGGElement;
}
