import { Point } from '@plait/core';
import { DetectResult, MindmapNode } from '../interfaces';
import { getRectangleByNode } from './graph';

/**
 *
 * @param targetNode
 * @param centerPoint
 * @returns DetectResult
 */

export const directionDetector = (targetNode: MindmapNode, centerPoint: Point): DetectResult => {
    const { x, y, width, height } = getRectangleByNode(targetNode);
    const yTop = targetNode.y;
    const yBottom = targetNode.y + targetNode.height;
    const yCenter = targetNode.y + targetNode.height / 2;
    const xLeft = targetNode.x;
    const xRight = x + width;

    if (centerPoint[0] > xLeft && centerPoint[0] < x && centerPoint[1] > y && centerPoint[1] < y + height) {
        return 'left';
    }
    if (centerPoint[0] > xRight && centerPoint[0] < xLeft + targetNode.width && centerPoint[1] > y && centerPoint[1] < y + height) {
        return 'right';
    }
    if (centerPoint[0] > x && centerPoint[0] < xRight && centerPoint[1] > yTop && centerPoint[1] < yCenter) {
        return 'top';
    }
    if (centerPoint[0] > x && centerPoint[0] < xRight && centerPoint[1] > yCenter && centerPoint[1] < yBottom) {
        return 'bottom';
    }

    return null;
};
