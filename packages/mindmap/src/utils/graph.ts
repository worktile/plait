import { MindmapNode } from '../interfaces/node';
import { PlaitBoard, Point, RectangleClient, distanceBetweenPointAndRectangle } from '@plait/core';
import { MindmapNodeElement } from '../interfaces';
import { ELEMENT_TO_NODE } from './weak-maps';

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

export function hitMindmapElement(board: PlaitBoard, point: Point, element: MindmapNodeElement) {
    const node = ELEMENT_TO_NODE.get(element);
    if (node && distanceBetweenPointAndRectangle(point[0], point[1], getRectangleByNode(node)) === 0) {
        return true;
    } else {
        return false;
    }
}
