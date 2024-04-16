import { PlaitBoard, PlaitElement } from '../interfaces';

export const sortElements = (board: PlaitBoard, elements: PlaitElement[], ascendingOrder = true) => {
    return [...elements].sort((a: PlaitElement, b: PlaitElement) => {
        const indexA = board.children.findIndex(child => child.id === a.id);
        const indexB = board.children.findIndex(child => child.id === b.id);
        return ascendingOrder ? indexA - indexB : indexB - indexA;
    });
};
