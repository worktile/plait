import { PlaitBoard, Transforms } from '@plait/core';
import { PlaitMultipleTextGeometry } from '../interfaces';
import { PlaitDrawShapeText } from '../generators/text.generator';

export const setDrawShapeText = (board: PlaitBoard, element: PlaitMultipleTextGeometry, text: PlaitDrawShapeText) => {
    const newTexts = element.texts?.map(item => {
        if (item.key === text.key) {
            return { ...item, ...text };
        }
        return item;
    });
    const newElement = {
        texts: newTexts
    };
    const path = board.children.findIndex(child => child === element);
    Transforms.setNode(board, newElement, [path]);
};
