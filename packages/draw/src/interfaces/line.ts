import { PlaitElement, Point } from '@plait/core';
import { Element } from 'slate';

export enum LineMarkerType {
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
    // 关联元素的 id
    boundId?: string;
    connection?: Point;
    marker: LineMarkerType;
}

export interface PlaitLine extends PlaitElement {
    type: 'line';
    shape: LineShape;
    points: Point[];

    source: LineHandle;
    target: LineHandle;

    texts?: LineText[];

    // node style attributes
    strokeColor?: string;
    strokeWidth?: number;

    opacity: number;
}

export interface PlaitStraightLine extends PlaitLine {
    shape: LineShape.straight;
}

export interface PlaitCurveLine extends PlaitLine {
    shape: LineShape.curve;
}

export interface PlaitElbowLine extends PlaitLine {
    shape: LineShape.elbow;
}
