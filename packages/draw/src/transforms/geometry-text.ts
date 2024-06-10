import { PlaitBoard, Point, Transforms, hasValidAngle, RectangleClient } from '@plait/core';
import { Element } from 'slate';
import { PlaitGeometry, PlaitText } from '../interfaces';
import { ShapeDefaultSpace } from '../constants';
import { Alignment, getFirstTextEditor, resetPointsAfterResize } from '@plait/common';
import { AlignEditor } from '@plait/text-plugins';
import { MIN_TEXT_WIDTH } from '../constants/text';

const normalizePoints = (board: PlaitBoard, element: PlaitGeometry, width: number, textHeight: number) => {
    let points = element.points;
    let autoSize = (element as PlaitText).autoSize;
    const defaultSpace = ShapeDefaultSpace.rectangleAndText;

    if (autoSize) {
        const newWidth = width < MIN_TEXT_WIDTH ? MIN_TEXT_WIDTH : width;
        const editor = getFirstTextEditor(element);
        if (AlignEditor.isActive(editor, Alignment.right)) {
            points = [
                [points[1][0] - (newWidth + defaultSpace * 2), points[0][1]],
                [points[1][0], points[0][1] + textHeight]
            ];
        } else if (AlignEditor.isActive(editor, Alignment.center)) {
            const oldWidth = Math.abs(points[0][0] - points[1][0]);
            const offset = (newWidth - oldWidth) / 2;
            points = [
                [points[0][0] - offset - defaultSpace, points[0][1]],
                [points[1][0] + offset + defaultSpace, points[0][1] + textHeight]
            ];
        } else {
            points = [points[0], [points[0][0] + newWidth + defaultSpace * 2, points[0][1] + textHeight]];
        }
        if (hasValidAngle(element)) {
            points = resetPointsAfterResize(
                RectangleClient.getRectangleByPoints(element.points),
                RectangleClient.getRectangleByPoints(points),
                RectangleClient.getCenterPoint(RectangleClient.getRectangleByPoints(element.points)),
                RectangleClient.getCenterPoint(RectangleClient.getRectangleByPoints(points)),
                element.angle!
            );
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
        const isTextHeightEqual = Math.round(textHeight) === Math.round(element.textHeight!);
        if (!isPointsEqual || !isTextHeightEqual) {
            const path = board.children.findIndex(child => child === element);
            Transforms.setNode(board, newElement, [path]);
        }
    }
};
