import { Ancestor, PlaitBoard, PlaitElement, RectangleClient } from '../interfaces';
import { depthFirstRecursion, getIsRecursionFunc } from './tree';

export function getRectangleByElements(board: PlaitBoard, elements: PlaitElement[], recursion: boolean): RectangleClient {
    const boundaryBox = {
        left: Number.MAX_VALUE,
        top: Number.MAX_VALUE,
        right: Number.NEGATIVE_INFINITY,
        bottom: Number.NEGATIVE_INFINITY
    };

    const calcRectangleClient = (node: PlaitElement) => {
        const nodeRectangle = board.getRectangle(node);
        if (nodeRectangle) {
            boundaryBox.left = Math.min(boundaryBox.left, nodeRectangle.x);
            boundaryBox.top = Math.min(boundaryBox.top, nodeRectangle.y);
            boundaryBox.right = Math.max(boundaryBox.right, nodeRectangle.x + nodeRectangle.width);
            boundaryBox.bottom = Math.max(boundaryBox.bottom, nodeRectangle.y + nodeRectangle.height);
        } else {
            console.error(`can not get rectangle of element:`, node);
        }
    };

    elements.forEach(element => {
        if (recursion) {
            depthFirstRecursion(
                element,
                node => calcRectangleClient(node),
                node => board.isRecursion(node)
            );
        } else {
            calcRectangleClient(element);
        }
    });

    if (boundaryBox.left === Number.MAX_VALUE) {
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
    }

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

export function getElementById<T extends PlaitElement = PlaitElement>(board: PlaitBoard, id: string, dataSource?: PlaitElement[]): T | undefined {
    if (!dataSource) {
        dataSource = findElements(board, { match: (element) => true, recursion: (element) => true });
    }
    let element = dataSource.find((element) => element.id === id) as T;
    return element;
}

export function findElements<T extends PlaitElement = PlaitElement>(
    board: PlaitBoard,
    options: {
        match: (element: PlaitElement) => boolean;
        recursion: (element: PlaitElement) => boolean;
    }
): T[] {
    let elements: T[] = [];
    depthFirstRecursion<Ancestor>(
        board,
        node => {
            if (!PlaitBoard.isBoard(node) && options.match(node)) {
                elements.push(node as T);
            }
        },
        (value: Ancestor) => {
            if (PlaitBoard.isBoard(value)) {
                return true;
            } else {
                return getIsRecursionFunc(board)(value) && options.recursion(value);
            }
        },
        true
    );
    return elements;
}
