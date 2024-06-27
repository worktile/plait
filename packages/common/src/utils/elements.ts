import { PlaitBoard, PlaitElement } from '@plait/core';
import { DEFAULT_FILL, TRANSPARENT } from '../constants';

export const getElementArea = (board: PlaitBoard, element: PlaitElement) => {
    const rectangle = board.getRectangle(element);
    if (rectangle) {
        return rectangle.width * rectangle.height;
    }
    return 0;
};

export const sortElementsByArea = (board: PlaitBoard, elements: PlaitElement[], direction: 'desc' | 'asc' = 'asc') => {
    return elements.sort((a, b) => {
        const areaA = getElementArea(board, a);
        const areaB = getElementArea(board, b);
        return direction === 'asc' ? areaA - areaB : areaB - areaA;
    });
};

export const isFilled = (fill: string) => {
    return fill && fill !== DEFAULT_FILL && fill !== TRANSPARENT;
};
