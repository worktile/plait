import { MindmapNode } from '../interfaces/node';
import { Point, RectangleClient } from '@plait/core';
import { PlaitPointerType, PlaitBoard } from '@plait/core';
import { depthFirstRecursion } from '@plait/core';

export function toRectangleClient(points: [Point, Point]): RectangleClient {
    const xArray = points.map(ele => ele[0]);
    const yArray = points.map(ele => ele[1]);
    const xMin = Math.min(...xArray);
    const xMax = Math.max(...xArray);
    const yMin = Math.min(...yArray);
    const yMax = Math.max(...yArray);
    const rect = { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin };
    return rect;
}

export function getRectangleByNode(node: MindmapNode): RectangleClient {
    const x = node.x + node.hGap;
    let y = node.y + node.vGap;
    const width = node.width - node.hGap * 2;
    const height = node.height - node.vGap * 2;
    return {
        x,
        y,
        width,
        height
    };
}

export function hitMindmapNode(board: PlaitBoard, point: Point, node: MindmapNode) {
    if (board.pointer === PlaitPointerType.hand) return false;
    const { x, y, width, height } = getRectangleByNode(node);
    return point[0] >= x && point[0] <= x + width && point[1] >= y && point[1] <= y + height;
}
