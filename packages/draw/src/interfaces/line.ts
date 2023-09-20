import { PlaitElement, Point } from '@plait/core';
import { Element } from 'slate';
import { LineComponent } from '../line.component';
import { PlaitGeometry } from './geometry';
import { StrokeStyle } from './element';

export enum LineMarkerType {
    arrow = 'arrow',
    none = 'none',
    openTriangle = 'open-triangle',
    solidTriangle = 'solid-triangle'
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
    width: number;
    height: number;
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

    texts: LineText[];

    // node style attributes
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: StrokeStyle;

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

export const PlaitLine = {
    getTextEditors(element: PlaitLine) {
        const component = PlaitElement.getComponent(element) as LineComponent;
        if (component) {
            const manage = component.textManages.find(manage => manage.isEditing);
            if (manage) {
                return [manage.componentRef.instance.editor];
            } else {
                return component.textManages.map(manage => manage.componentRef.instance.editor);
            }
        }
        throw new Error('can not get correctly component in get text editor');
    },
    isSourceMark(line: PlaitLine, markType: LineMarkerType) {
        return line.source.marker === markType;
    },
    isTargetMark(line: PlaitLine, markType: LineMarkerType) {
        return line.target.marker === markType;
    },
    isBoundElementOfSource(line: PlaitLine, element: PlaitGeometry) {
        return line.source.boundId === element.id;
    },
    isBoundElementOfTarget(line: PlaitLine, element: PlaitGeometry) {
        return line.target.boundId === element.id;
    }
};
