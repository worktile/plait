import { PlaitBoard } from '@plait/core';
import { MindElement } from '../../interfaces/element';

export const getAvailableProperty = (board: PlaitBoard, element: MindElement, propertyKey: keyof MindElement) => {
    return element[propertyKey];
};
