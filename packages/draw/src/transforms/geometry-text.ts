import { PlaitBoard, Transforms } from '@plait/core';
import { Element } from 'slate';
import { PlaitGeometry, PlaitText } from '../interfaces';
import { DefaultTextProperty, ShapeDefaultSpace } from '../constants';

const normalizePoints = (board: PlaitBoard, element: PlaitGeometry, width: number, textHeight: number) => {
    let points = element.points;
    let autoSize = (element as PlaitText).autoSize;
    width = width;
    textHeight = textHeight;
    const defaultSpace = ShapeDefaultSpace.rectangleAndText;

    if (autoSize) {
        points = [points[0], [points[0][0] + width + defaultSpace * 2, points[0][1] + textHeight]];

        if (width >= DefaultTextProperty.maxWidth) {
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
