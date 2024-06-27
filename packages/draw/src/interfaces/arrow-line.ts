import { Direction, PlaitBoard, PlaitElement, Point, PointOfRectangle, Vector, getElementById, rotatePointsByElement } from '@plait/core';
import { Element } from 'slate';
import { StrokeStyle } from './element';
import { getConnectionPoint } from '../utils/arrow-line/arrow-line-common';
import { PlaitShapeElement } from '.';

export enum ArrowLineMarkerType {
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

export enum ArrowLineShape {
    straight = 'straight',
    curve = 'curve',
    elbow = 'elbow'
}

export enum ArrowLineHandleKey {
    source = 'source',
    target = 'target'
}

export interface ArrowLineText {
    text: Element;
    // Percentage of positioning based on line length
    position: number;
    width: number;
    height: number;
}

export interface ArrowLineHandle {
    // The id of the bounded element
    boundId?: string;
    connection?: PointOfRectangle;
    marker: ArrowLineMarkerType;
}

export interface ArrowLineHandleRef {
    key: ArrowLineHandleKey;
    direction: Direction;
    point: PointOfRectangle;
    vector: Vector;
    boundElement?: PlaitShapeElement;
}

export interface ArrowLineHandleRefPair {
    source: ArrowLineHandleRef;
    target: ArrowLineHandleRef;
}

export interface PlaitArrowLine extends PlaitElement {
    type: 'arrow-line';
    shape: ArrowLineShape;
    points: Point[];

    source: ArrowLineHandle;
    target: ArrowLineHandle;

    texts: ArrowLineText[];

    // node style attributes
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: StrokeStyle;

    opacity: number;
}

export interface PlaitStraightArrowLine extends PlaitArrowLine {
    shape: ArrowLineShape.straight;
}

export interface PlaitCurveArrowLine extends PlaitArrowLine {
    shape: ArrowLineShape.curve;
}

export interface PlaitElbowArrowLine extends PlaitArrowLine {
    shape: ArrowLineShape.elbow;
}

export const PlaitArrowLine = {
    isSourceMarkOrTargetMark(line: PlaitArrowLine, markType: ArrowLineMarkerType, handleKey: ArrowLineHandleKey) {
        if (handleKey === ArrowLineHandleKey.source) {
            return line.source.marker === markType;
        } else {
            return line.target.marker === markType;
        }
    },
    isSourceMark(line: PlaitArrowLine, markType: ArrowLineMarkerType) {
        return PlaitArrowLine.isSourceMarkOrTargetMark(line, markType, ArrowLineHandleKey.source);
    },
    isTargetMark(line: PlaitArrowLine, markType: ArrowLineMarkerType) {
        return PlaitArrowLine.isSourceMarkOrTargetMark(line, markType, ArrowLineHandleKey.target);
    },
    isBoundElementOfSource(line: PlaitArrowLine, element: PlaitShapeElement) {
        return line.source.boundId === element.id;
    },
    isBoundElementOfTarget(line: PlaitArrowLine, element: PlaitShapeElement) {
        return line.target.boundId === element.id;
    },
    getPoints(board: PlaitBoard, line: PlaitArrowLine) {
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
