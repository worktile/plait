import { Ancestor, PlaitBoard, PlaitElement, Point, RectangleClient } from '../interfaces';
import { getSelectionAngle, hasSameAngle, resizeSelectionRectangle, rotatePoints } from './angle';
import { depthFirstRecursion, getIsRecursionFunc } from './tree';

export function getRectangleByElements(board: PlaitBoard, elements: PlaitElement[], recursion: boolean): RectangleClient {
    const rectangleCornerPoints: [Point, Point, Point, Point][] = [];
    const callback = (node: PlaitElement) => {
        const nodeRectangle = board.getRectangle(node);
        if (nodeRectangle) {
            const cornerPoints = RectangleClient.getCornerPoints(nodeRectangle);
            const rotatedCornerPoints = rotatePoints(cornerPoints, RectangleClient.getCenterPoint(nodeRectangle), node.angle || 0) as [
                Point,
                Point,
                Point,
                Point
            ];
            rectangleCornerPoints.push(rotatedCornerPoints);
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
    if (rectangleCornerPoints.length > 0) {
        if (hasSameAngle(elements)) {
            const angle = getSelectionAngle(elements);
            return resizeSelectionRectangle(rectangleCornerPoints, angle);
        } else {
            const flatPoints: Point[] = rectangleCornerPoints.reduce((acc: Point[], val) => {
                return acc.concat(val);
            }, []);
            return RectangleClient.getRectangleByPoints(flatPoints);
        }
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
