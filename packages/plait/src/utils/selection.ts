import { PlaitBoard } from '../interfaces/board';
import { PlaitElement, Range } from '../interfaces';

export const isIntersectionSelectedElement = (board: PlaitBoard, selectedElements: PlaitElement[], ranges: Range[]) => {
    let isIntersectionSelectedElement = false;
    if (board.selection && selectedElements.length) {
        selectedElements.map(item => {
            if (!isIntersectionSelectedElement) {
                isIntersectionSelectedElement = ranges.some(range => {
                    return board.isIntersectionSelection(item, range);
                });
            }
        });
    }

    return isIntersectionSelectedElement;
};

export const isIntersectionElement = (board: PlaitBoard, nodes: PlaitElement[] = board.children) => {
    let intersectionElement = false;
    nodes.map(item => {
        if (!intersectionElement) {
            intersectionElement = !!board.selection?.ranges.some(range => board.isIntersectionSelection(item, range));
        }
        if (item.children && !intersectionElement) {
            intersectionElement = isIntersectionElement(board, item.children as PlaitElement[]);
        }
    });
    return intersectionElement;
};
