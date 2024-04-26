import { PlaitBoard, PlaitElement } from '../interfaces';

export const sortElements = (board: PlaitBoard, elements: PlaitElement[], ascendingOrder = true) => {
    return [...elements].sort((a: PlaitElement, b: PlaitElement) => {
        const pathA = PlaitBoard.findPath(board, a);
        const pathB = PlaitBoard.findPath(board, b);
        return ascendingOrder ? pathA[0] - pathB[0] : pathB[0] - pathA[0];
    });
};
