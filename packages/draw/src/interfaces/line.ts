import { PlaitElement, Point } from '@plait/core';
import { Element } from 'slate';

export enum LineMarkType {
    arrow = 'arrow',
    none = 'none'
}

export enum LineShape {
    straight = 'straight',
    curve = 'curve',
    elbow = 'elbow'
}

export interface LineText {
    text: Element;
    //基于线长度，定位的百分比
    position: number;
}

export interface LineHandle {
    id: string;
    mark: LineMarkType;
    connection: Point;
}

export interface PlaitBaseLine extends PlaitElement {
    type: 'line';
    shape: LineShape;

    source: LineHandle;
    target: LineHandle;

    texts: LineText[];

    controlPoints?: Point[];

    // node style attributes
    strokeColor?: string;
    strokeWidth?: number;

    opacity: number;
}

export interface PlaitStraightLine extends PlaitBaseLine {
    shape: LineShape.straight;
}

export interface PlaitCurveLine extends PlaitBaseLine {
    shape: LineShape.curve;
}

export interface PlaitElbowLine extends PlaitBaseLine {
    shape: LineShape.elbow;
}
