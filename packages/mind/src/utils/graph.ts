import { MindNode } from '../interfaces/node';
import { PlaitBoard, Point, RectangleClient, distanceBetweenPointAndRectangle } from '@plait/core';
import { MindElement } from '../interfaces';
import { ELEMENT_TO_NODE } from './weak-maps';

export function getRectangleByNode(node: MindNode): RectangleClient {
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

export function hitMindmapElement(board: PlaitBoard, point: Point, element: MindElement) {
    const node = ELEMENT_TO_NODE.get(element);
    if (node && distanceBetweenPointAndRectangle(point[0], point[1], getRectangleByNode(node)) === 0) {
        return true;
    } else {
        return false;
    }
}
