import { PlaitElement } from '@plait/core';

export interface PlaitBaseShape extends PlaitElement {
    topic: Element;

    // node style attributes
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;

    angle: number;
    opacity: number;
}

export interface PlaitRectangle extends PlaitBaseShape {
    type: 'rectangle';
}

export interface PlaitEllipse extends PlaitBaseShape {
    type: 'ellipse';
}

export interface PlaitDiamond extends PlaitBaseShape {
    type: 'diamond';
}
