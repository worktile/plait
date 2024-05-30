import { Direction, PlaitBoard, PlaitElement, Point, PointOfRectangle, Vector, getElementById, rotatePointsByElement } from '@plait/core';
import { Element } from 'slate';
import { PlaitGeometry } from './geometry';
import { StrokeStyle } from './element';
import { getConnectionPoint } from '../utils/line/line-common';
import { PlaitShapeElement } from '.';

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
    // Percentage of positioning based on line length
    position: number;
    width: number;
    height: number;
}

export interface LineHandle {
    // The id of the bounded element
    boundId?: string;
    connection?: PointOfRectangle;
    marker: LineMarkerType;
}

export interface LineHandleRef {
    key: LineHandleKey;
    direction: Direction;
    point: PointOfRectangle;
    vector: Vector;
    boundElement?: PlaitShapeElement;
}

export interface LineHandleRefPair {
    source: LineHandleRef;
    target: LineHandleRef;
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
    isBoundElementOfSource(line: PlaitLine, element: PlaitShapeElement) {
        return line.source.boundId === element.id;
    },
    isBoundElementOfTarget(line: PlaitLine, element: PlaitShapeElement) {
        return line.target.boundId === element.id;
    },
    getPoints(board: PlaitBoard, line: PlaitLine) {
        let sourcePoint;
        if (line.source.boundId) {
            const sourceElement = getElementById<PlaitShapeElement>(board, line.source.boundId)!;
            const sourceConnectionPoint = getConnectionPoint(sourceElement, line.source.connection!);
            sourcePoint = rotatePointsByElement(sourceConnectionPoint, sourceElement) || sourceConnectionPoint;
        } else {
            sourcePoint = line.points[0];
        }

        let targetPoint;
        if (line.target.boundId) {
            const targetElement = getElementById<PlaitShapeElement>(board, line.target.boundId)!;
            const targetConnectionPoint = getConnectionPoint(targetElement, line.target.connection!);
            targetPoint = rotatePointsByElement(targetConnectionPoint, targetElement) || targetConnectionPoint;
        } else {
            targetPoint = line.points[line.points.length - 1];
        }
        const restPoints = line.points.length > 2 ? line.points.slice(1, line.points.length - 1) : [];
        return [sourcePoint, ...restPoints, targetPoint];
    }
};
