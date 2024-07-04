import { PlaitBoard, Transforms } from '@plait/core';
import { PlaitVectorLine } from '../interfaces';
import { getSelectedVectorLineElements } from '../utils';

export const setVectorLineShape = (board: PlaitBoard, newProperties: Partial<PlaitVectorLine>) => {
    const elements = getSelectedVectorLineElements(board);
    elements.map(element => {
        const _properties = { ...newProperties };
        if (element.shape === newProperties.shape) {
            return;
        }
        const path = PlaitBoard.findPath(board, element);
        Transforms.setNode(board, _properties, path);
    });
};
