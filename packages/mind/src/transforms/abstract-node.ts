import { PlaitBoard, Transforms } from '@plait/core';
import { AbstractMap } from '../interfaces/abstract';
import { MindElement } from '../interfaces/element';

export const setAttributeByMap = (board: PlaitBoard, map: AbstractMap) => {
    map.forEach((newProperty, element) => {
        const start = element.start! + newProperty.start;
        const end = element.end! + newProperty.end;
        const path = PlaitBoard.findPath(board, element as MindElement);

        if (start > end) {
            Transforms.removeNode(board, path);
        } else {
            Transforms.setNode(board, { start, end }, path);
        }
    });
};
