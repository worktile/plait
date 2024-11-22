import { PlaitBoard, Transforms } from '@plait/core';
import { PlaitMultipleTextGeometry } from '../interfaces';
import { DrawTextInfo } from '../generators/text.generator';

export const setDrawTexts = (board: PlaitBoard, element: PlaitMultipleTextGeometry, text: DrawTextInfo) => {
    const newTexts = element.texts?.map(item => {
        if (item.id === text.id) {
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
