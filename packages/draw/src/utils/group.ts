import { PlaitBoard, PlaitElement, addSelectedElement, getRectangleByElements } from '@plait/core';
import { PlaitDrawElement } from '../interfaces';
import { PlaitGroup } from '../interfaces/group';

export const getElementsByGroup = (board: PlaitBoard, element: PlaitElement): PlaitElement[] => {
    return board.children.filter(
        value => PlaitDrawElement.isDrawElement(value) && (value as PlaitDrawElement).parentId === element.id
    ) as PlaitElement[];
};

export const getGroupRectangle = (board: PlaitBoard, element: PlaitElement) => {
    const elementsInGroup = getElementsByGroup(board, element) as PlaitElement[];
    return getRectangleByElements(board, elementsInGroup, false);
};

export const getGroupByElement = (board: PlaitBoard, element: PlaitElement) => {
    if (element?.parentId) {
        return board.children.find(item => item.id === element?.parentId);
    }
    return null;
};

export const selectGroup = (board: PlaitBoard, group: PlaitGroup) => {
    const elements = getElementsByGroup(board, group);
    elements.forEach(item => {
        addSelectedElement(board, item);
    });
};
