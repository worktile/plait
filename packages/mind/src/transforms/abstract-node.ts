import { PlaitBoard, Transforms } from '@plait/core';
import { AbstractRefs } from '../interfaces/abstract';
import { MindElement } from '../interfaces/element';

export const setAbstractByRef = (board: PlaitBoard, abstractRefs: AbstractRefs) => {
    abstractRefs.forEach((newProperty, element) => {
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
