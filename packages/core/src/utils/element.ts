import { Ancestor, PlaitBoard, PlaitElement, RectangleClient } from '../interfaces';
import { depthFirstRecursion, getIsRecursionFunc } from './tree';
// TODO  rotatePoints 方法无法引入;core 依赖了 common
import { rotatePoints } from '../../../common/src/utils';

export function getRectangleByElements(board: PlaitBoard, elements: PlaitElement[], recursion: boolean): RectangleClient {
    const rectangles: RectangleClient[] = [];
    const angle = getSelectionAngle(elements);
    let isRotateBasedOrigin: boolean = false;
    const callback = (node: PlaitElement) => {
        const nodeOriginRectangle = board.getRectangle(node);
        if (nodeOriginRectangle) {
            const points = RectangleClient.getCornerPoints(nodeOriginRectangle);
            const rotatedPoints = rotatePoints(points, RectangleClient.getCenterPoint(nodeOriginRectangle), node.angle);
            if (angle) {
                const reRotatedPoints = rotatePoints(rotatedPoints, [0, 0], -angle);
                isRotateBasedOrigin = true;
                const nodeRotatedRectangle = RectangleClient.getRectangleByPoints(reRotatedPoints);
                rectangles.push(nodeRotatedRectangle);
            } else {
                const nodeRotatedRectangle = RectangleClient.getRectangleByPoints(rotatedPoints);
                rectangles.push(nodeRotatedRectangle);
            }
        } else {
            console.error(`can not get rectangle of element:`, node);
        }
    };
    elements.forEach(element => {
        if (recursion) {
            depthFirstRecursion(
                element,
                node => callback(node),
                node => board.isRecursion(node)
            );
        } else {
            callback(element);
        }
    });
    if (rectangles.length > 0) {
        let rectangle = RectangleClient.getBoundingRectangle(rectangles);
        if (isRotateBasedOrigin && rectangle) {
            const rectangleCorners = RectangleClient.getCornerPoints(rectangle);
            const rotatedCornersBaseOrigin = rotatePoints(rectangleCorners, [0, 0], angle);
            const centerPoint = RectangleClient.getCenterPoint(RectangleClient.getRectangleByPoints(rotatedCornersBaseOrigin));
            const rotatedCornersBaseCenter = rotatePoints(rotatedCornersBaseOrigin, centerPoint, -angle);
            rectangle = RectangleClient.getRectangleByPoints(rotatedCornersBaseCenter);
        }
        return rectangle;
    } else {
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
    }
}

export function getBoardRectangle(board: PlaitBoard): RectangleClient {
    return getRectangleByElements(board, board.children, true);
}

export function getElementById<T extends PlaitElement = PlaitElement>(
    board: PlaitBoard,
    id: string,
    dataSource?: PlaitElement[]
): T | undefined {
    if (!dataSource) {
        dataSource = findElements(board, { match: element => true, recursion: element => true });
    }
    let element = dataSource.find(element => element.id === id) as T;
    return element;
}

export function findElements<T extends PlaitElement = PlaitElement>(
    board: PlaitBoard,
    options: {
        match: (element: PlaitElement) => boolean;
        recursion: (element: PlaitElement) => boolean;
        isReverse?: boolean;
    }
): T[] {
    let elements: T[] = [];
    const isReverse = options.isReverse ?? true;
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
        isReverse
    );
    return elements;
}

// getSelectionAngle
export const getSelectionAngle = (elements: PlaitElement[]) => {
    let angle = elements[0].angle || 0;
    if (elements.find(item => item.angle !== angle)) {
        angle = 0;
    }
    return angle;
};
