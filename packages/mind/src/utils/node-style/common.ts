import { PlaitBoard } from '@plait/core';
import { MindElement } from '../../interfaces/element';

export const getAvailableProperty = (board: PlaitBoard, element: MindElement, propertyKey: keyof MindElement) => {
    const ancestors = MindElement.getAncestors(board, element) as MindElement[];
    ancestors.unshift(element);
    const ancestor = ancestors.find(value => value[propertyKey]);
    if (ancestor) {
        return ancestor[propertyKey];
    } else {
        return undefined;
    }
};
