import { PlaitElement } from '@plait/core';
import { Element } from 'slate';

export enum GeometryShape {
    rectangle = 'rectangle',
    ellipse = 'ellipse',
    diamond = 'diamond'
}

export interface PlaitBaseGeometry extends PlaitElement {
    type: 'geometry';
    shape: GeometryShape;

    topic: Element;

    // node style attributes
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;

    angle: number;
    opacity: number;
}

export interface PlaitRectangle extends PlaitBaseGeometry {
    shape: GeometryShape.rectangle;
}

export interface PlaitEllipse extends PlaitBaseGeometry {
    shape: GeometryShape.ellipse;
}

export interface PlaitDiamond extends PlaitBaseGeometry {
    shape: GeometryShape.diamond;
}
