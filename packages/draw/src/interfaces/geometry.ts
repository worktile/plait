import { PlaitElement, Point } from '@plait/core';
import { Element } from 'slate';

export enum GeometryShape {
    rectangle = 'rectangle',
    ellipse = 'ellipse',
    diamond = 'diamond',
    text = 'text'
}

export interface PlaitGeometry extends PlaitElement {
    points: [Point, Point];
    type: 'geometry';
    shape: GeometryShape;

    text: Element;

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
