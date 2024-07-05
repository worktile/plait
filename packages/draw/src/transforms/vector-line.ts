import { PlaitBoard, Transforms } from '@plait/core';
import { PlaitVectorLine } from '../interfaces';
import { getSelectedVectorLineElements } from '../utils';

export const setVectorLineShape = (board: PlaitBoard, newProperties: Partial<PlaitVectorLine>) => {
    const elements = getSelectedVectorLineElements(board);
    elements.map(element => {
        if (element.shape === newProperties.shape) {
            return;
        }
        const path = PlaitBoard.findPath(board, element);
        Transforms.setNode(board, { ...newProperties }, path);
    });
};
