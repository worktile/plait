import { PlaitElement, Point } from '@plait/core';
import { StrokeStyle } from './element';
import { ArrowLineShape } from './arrow-line';

export enum VectorLineShape {
    straight = ArrowLineShape.straight,
    curve = ArrowLineShape.curve
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
