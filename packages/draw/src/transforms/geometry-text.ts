import { PlaitBoard, Point, Transforms } from '@plait/core';
import { Element } from 'slate';
import { PlaitGeometry, PlaitText } from '../interfaces';
import { DefaultTextProperty, GeometryThreshold, ShapeDefaultSpace } from '../constants';

const normalizePoints = (board: PlaitBoard, element: PlaitGeometry, width: number, textHeight: number) => {
    let points = element.points;
    let autoSize = (element as PlaitText).autoSize;
    const defaultSpace = ShapeDefaultSpace.rectangleAndText;

    if (autoSize) {
        points = [points[0], [points[0][0] + width + defaultSpace * 2, points[0][1] + textHeight]];

        if (width >= GeometryThreshold.defaultTextMaxWidth) {
            points = [points[0], [points[0][0] + width + defaultSpace * 2, points[0][1] + textHeight]];
        }
    }

    return { points };
};

export const setText = (board: PlaitBoard, element: PlaitGeometry, text: Element, width: number, textHeight: number) => {
    const newElement = {
        text,
        textHeight,
        ...normalizePoints(board, element, width, textHeight)
    };

    const path = board.children.findIndex(child => child === element);

    Transforms.setNode(board, newElement, [path]);
};

export const setTextSize = (board: PlaitBoard, element: PlaitGeometry, textWidth: number, textHeight: number) => {
    if ((element as PlaitText).autoSize) {
        const newElement = {
            textHeight,
            ...normalizePoints(board, element, textWidth, textHeight)
        };
        const isPointsEqual =
            Point.isEquals(element.points[0], newElement.points[0]) && Point.isEquals(element.points[1], newElement.points[1]);
        const isTextHeightEqual = Math.round(textHeight) === Math.round(element.textHeight);
        if (!isPointsEqual || !isTextHeightEqual) {
            const path = board.children.findIndex(child => child === element);
            Transforms.setNode(board, newElement, [path]);
        }
    }
};
