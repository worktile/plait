import { Direction, PlaitBoard, PlaitElement, Point, PointOfRectangle, Vector, getElementById } from '@plait/core';
import { Element } from 'slate';
import { LineComponent } from '../line.component';
import { PlaitGeometry } from './geometry';
import { StrokeStyle } from './element';
import { getConnectionPoint } from '../utils';
import { PlaitImage } from '../interfaces/image';

export enum LineMarkerType {
    arrow = 'arrow',
    none = 'none',
    openTriangle = 'open-triangle',
    solidTriangle = 'solid-triangle',
    sharpArrow = 'sharp-arrow',
    oneSideUp = 'one-side-up',
    oneSideDown = 'one-side-down',
    hollowTriangle = 'hollow-triangle',
    singleSlash = 'single-slash'
}

export enum LineShape {
    straight = 'straight',
    curve = 'curve',
    elbow = 'elbow'
}

export enum LineHandleKey {
    source = 'source',
    target = 'target'
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
    connection?: PointOfRectangle;
    marker: LineMarkerType;
}

export interface LineHandleRef {
    key: LineHandleKey;
    direction: Direction;
    point: PointOfRectangle;
    vector: Vector;
    boundElement?: PlaitGeometry;
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
    isSourceMarkOrTargetMark(line: PlaitLine, markType: LineMarkerType, handleKey: LineHandleKey) {
        if (handleKey === LineHandleKey.source) {
            return line.source.marker === markType;
        } else {
            return line.target.marker === markType;
        }
    },
    isSourceMark(line: PlaitLine, markType: LineMarkerType) {
        return PlaitLine.isSourceMarkOrTargetMark(line, markType, LineHandleKey.source);
    },
    isTargetMark(line: PlaitLine, markType: LineMarkerType) {
        return PlaitLine.isSourceMarkOrTargetMark(line, markType, LineHandleKey.target);
    },
    isBoundElementOfSource(line: PlaitLine, element: PlaitGeometry | PlaitImage) {
        return line.source.boundId === element.id;
    },
    isBoundElementOfTarget(line: PlaitLine, element: PlaitGeometry | PlaitImage) {
        return line.target.boundId === element.id;
    },
    getPoints(board: PlaitBoard, line: PlaitLine) {
        let sourcePoint = line.source.boundId
            ? getConnectionPoint(getElementById<PlaitGeometry>(board, line.source.boundId)!, line.source.connection!)
            : line.points[0];
        let targetPoint = line.target.boundId
            ? getConnectionPoint(getElementById<PlaitGeometry>(board, line.target.boundId)!, line.target.connection!)
            : line.points[line.points.length - 1];
        const restPoints = line.points.length > 2 ? line.points.slice(1, line.points.length - 1) : [];
        return [sourcePoint, ...restPoints, targetPoint];
    }
};
