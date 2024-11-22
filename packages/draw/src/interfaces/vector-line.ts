import { Path, PlaitElement, Point } from '@plait/core';
import { ArrowLineShape } from './arrow-line';
import { StrokeStyle } from '@plait/common';

export enum VectorPenPointerType {
    vectorPen = 'vectorPen'
}

export enum VectorLineShape {
    straight = ArrowLineShape.straight,
    curve = ArrowLineShape.curve
}

export interface VectorLineRef {
    start?: Point;
    element?: PlaitVectorLine;
    path?: Path;
    shape: VectorLineShape;
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
