import { PlaitElement, Point } from '@plait/core';
import { StrokeStyle } from './element';
import { LineShape } from './line';

export enum VectorLineShape {
    straight = LineShape.straight,
    curve = LineShape.curve
}

export interface PlaitVectorLine extends PlaitElement {
    type: 'vector-line';
    shape: VectorLineShape;
    points: Point[];
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: StrokeStyle;
    fill?: string;
    opacity: number;
}
