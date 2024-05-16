import { PlaitBoard, Point, Transforms } from '@plait/core';
import { Element } from 'slate';
import { PlaitGeometry, PlaitMultipleTextGeometry, PlaitText } from '../interfaces';
import { ShapeDefaultSpace } from '../constants';
import { AlignEditor, Alignment } from '@plait/text';
import { getFirstTextEditor } from '@plait/common';
import { PlaitDrawShapeText } from '../generators/text.generator';

// TODO
const normalizePoints = (board: PlaitBoard, element: PlaitGeometry, width: number, textHeight: number) => {
    let points = element.points;
    let autoSize = (element as PlaitText).autoSize;
    const defaultSpace = ShapeDefaultSpace.rectangleAndText;

    if (autoSize) {
        const editor = getFirstTextEditor(element);
        if (AlignEditor.isActive(editor, Alignment.right)) {
            points = [
                [points[1][0] - (width + defaultSpace * 2), points[0][1]],
                [points[1][0], points[0][1] + textHeight]
            ];
        } else if (AlignEditor.isActive(editor, Alignment.center)) {
            const oldWidth = Math.abs(points[0][0] - points[1][0]);
            const offset = (width - oldWidth) / 2;
            points = [
                [points[0][0] - offset - defaultSpace, points[0][1]],
                [points[1][0] + offset + defaultSpace, points[0][1] + textHeight]
            ];
        } else {
            points = [points[0], [points[0][0] + width + defaultSpace * 2, points[0][1] + textHeight]];
        }
    }

    return { points };
};

export const setDrawShapeText = (
    board: PlaitBoard,
    element: PlaitMultipleTextGeometry,
    text: PlaitDrawShapeText,
    width: number,
    textHeight: number
) => {
    const newTexts = element.texts?.map(item => {
        if (item.key === text.key) {
            return { ...item, ...text };
        }
        return item;
    });
    const newElement = {
        texts: newTexts,
        ...normalizePoints(board, (element as unknown) as PlaitGeometry, width, textHeight)
    };
    const path = board.children.findIndex(child => child === element);
    Transforms.setNode(board, newElement, [path]);
};
