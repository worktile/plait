import { PlaitBoard, PlaitElement, RectangleClient } from '../interfaces';
import { depthFirstRecursion } from './tree';

export function getRectangleByElements(board: PlaitBoard, elements: PlaitElement[], recursion: boolean): RectangleClient {
    const boundaryBox = {
        left: Number.MAX_VALUE,
        top: Number.MAX_VALUE,
        right: Number.MIN_VALUE,
        bottom: Number.MIN_VALUE
    };

    const calcRectangleClient = (node: PlaitElement) => {
        const nodeRectangle = board.getRectangle(node);
        if (nodeRectangle) {
            boundaryBox.left = Math.min(boundaryBox.left, nodeRectangle.x);
            boundaryBox.top = Math.min(boundaryBox.top, nodeRectangle.y);
            boundaryBox.right = Math.max(boundaryBox.right, nodeRectangle.x + nodeRectangle.width);
            boundaryBox.bottom = Math.max(boundaryBox.bottom, nodeRectangle.y + nodeRectangle.height);
        }
    };

    elements.forEach(element => {
        if (recursion) {
            depthFirstRecursion(element, node => calcRectangleClient(node));
        } else {
            calcRectangleClient(element);
        }
    });
    return {
        x: boundaryBox.left,
        y: boundaryBox.top,
        width: boundaryBox.right - boundaryBox.left,
        height: boundaryBox.bottom - boundaryBox.top
    };
}

export function getBoardRectangle(board: PlaitBoard): RectangleClient {
    return getRectangleByElements(board, board.children, true);
}
