import { PlaitElement } from '@plait/core';
import { Element } from 'slate';

export enum GeoType {
    rectangle = 'rectangle',
    ellipse = 'ellipse',
    diamond = 'diamond'
}

export interface PlaitBaseShape extends PlaitElement {
    type: 'geometry';
    shape: string;

    topic: Element;

    // node style attributes
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;

    angle: number;
    opacity: number;
}

export interface PlaitRectangle extends PlaitBaseShape {
    shape: GeoType.rectangle;
}

export interface PlaitEllipse extends PlaitBaseShape {
    shape: GeoType.ellipse;
}

export interface PlaitDiamond extends PlaitBaseShape {
    shape: GeoType.diamond;
}
