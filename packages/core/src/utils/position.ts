import { PlaitBoard, PlaitElement } from '../interfaces';

export const sortElements = (board: PlaitBoard, elements: PlaitElement[], ascendingOrder = true) => {
    return [...elements].sort((a: PlaitElement, b: PlaitElement) => {
        const pathA = board.children.findIndex(item=> item.id === a.id);
        const pathB = board.children.findIndex(item=> item.id === b.id);
        return ascendingOrder ? pathA - pathB : pathB - pathA;
    });
};
