import { PlaitBoard, PlaitElement, RectangleClient } from '../interfaces';
import { depthFirstRecursion } from './tree';

export function getRectangleByElements(board: PlaitBoard, elements: PlaitElement[], recursion: boolean): RectangleClient {
    let boundaryRectangle: RectangleClient = {
        x: Number.MAX_VALUE,
        y: Number.MAX_VALUE,
        width: 0,
        height: 0
    };

    const calcNodeRectangleClient = (node: PlaitElement, index?: number) => {
        const crrentRectangleNode = board.getRectangle(node);
        if (crrentRectangleNode) {
            const { width, height, x, y } = crrentRectangleNode;
            boundaryRectangle = index === 0 ? { width, height, x, y } : boundaryRectangle;
            const minX = index === 0 ? x : Math.min(x, boundaryRectangle.x);
            const minY = index === 0 ? y : Math.min(y, boundaryRectangle.y);
            const right = Math.max(x + width, boundaryRectangle.x + boundaryRectangle.width);
            const bottom = Math.max(y + height, boundaryRectangle.y + boundaryRectangle.height);
            boundaryRectangle.width = right - minX;
            boundaryRectangle.height = bottom - minY;
            boundaryRectangle.x = minX;
            boundaryRectangle.y = minY;
        }
    };

    elements.forEach((element, index) => {
        if (recursion) {
            depthFirstRecursion(element, node => calcNodeRectangleClient(node));
        } else {
            calcNodeRectangleClient(element, index);
        }
    });
    // 处理边框
    boundaryRectangle.x -= 2;
    boundaryRectangle.width += 4;
    boundaryRectangle.y -= 2;
    boundaryRectangle.height += 4;
    return boundaryRectangle;
}
