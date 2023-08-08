import { PlaitElement, Point } from '@plait/core';
import { Element } from 'slate';

export enum LineMarkType {
    arrow = 'arrow',
    none = 'none'
}

export interface LineText {
    text: Element;
    //基于线长度，定位的百分比
    position: number;
}

export interface LineHandle {
    id: string;
    mark: Element;
    connection: number[];
}

export interface PlaitBaseLine extends PlaitElement {
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
    type: 'straight';
}

export interface PlaitCurveLine extends PlaitBaseLine {
    type: 'curve';
}
