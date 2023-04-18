import { Point } from '@plait/core';
import { DetectResult, MindmapNode, MindmapNodeElement } from '../interfaces';
import { getRectangleByNode } from './graph';
import { ELEMENT_TO_NODE } from './weak-maps';

/**
 *
 * @param targetNode
 * @param centerPoint
 * @returns DetectResult[] | null
 */

export const directionDetector = (targetElement: MindmapNodeElement, centerPoint: Point): DetectResult[] | null => {
    const node = ELEMENT_TO_NODE.get(targetElement) as MindmapNode;
    const { x, y, width, height } = getRectangleByNode(node);
    const yCenter = y + height / 2;
    const xCenter = x + width / 2;

    const top = node.y;
    const bottom = node.y + node.height;
    const left = node.x;
    const right = node.x + node.width;
    const direction: DetectResult[] = [];

    // x 轴
    if (centerPoint[1] > y && centerPoint[1] < y + height) {
        if (centerPoint[0] > left && centerPoint[0] < xCenter) {
            direction.push('left');
        }
        if (centerPoint[0] > xCenter && centerPoint[0] < right) {
            direction.push('right');
        }
        // 重合区域，返回两个方向
        if ((centerPoint[0] > x && centerPoint[0] < xCenter) || (centerPoint[0] > xCenter && centerPoint[0] < x + width)) {
            if (centerPoint[1] < yCenter) {
                direction.push('top');
            } else {
                direction.push('bottom');
            }
        }
        return direction.length ? direction : null;
    }

    // y 轴
    if (centerPoint[0] > x && centerPoint[0] < x + width) {
        if (centerPoint[1] > top && centerPoint[1] < yCenter) {
            direction.push('top');
        }
        if (centerPoint[1] > yCenter && centerPoint[1] < bottom) {
            direction.push('bottom');
        }
        if ((centerPoint[1] > y && centerPoint[1] < y + height) || (centerPoint[1] > yCenter && centerPoint[1] < y + height)) {
            if (centerPoint[0] < xCenter) {
                direction.push('left');
            } else {
                direction.push('right');
            }
        }
        return direction.length ? direction : null;
    }

    return null;
};
