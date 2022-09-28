import { Point } from '@plait/core';
import { DetectResult, MindmapNode } from '../interfaces';
import { getRectangleByNode } from './graph';

/**
 *
 * @param targetNode
 * @param centerPoint
 * @returns DetectResult[] | null
 */

export const directionDetector = (targetNode: MindmapNode, centerPoint: Point): DetectResult[] | null => {
    const { x, y, width, height } = getRectangleByNode(targetNode);
    const yCenter = y + height / 2;
    const xCenter = x + width / 2;

    const top = targetNode.y;
    const bottom = targetNode.y + targetNode.height;
    const left = targetNode.x;
    const right = targetNode.x + targetNode.width;

    if (centerPoint[0] > left && centerPoint[0] < xCenter && centerPoint[1] > y && centerPoint[1] < y + height) {
        const direction: DetectResult[] = ['left'];
        if (centerPoint[0] > x && centerPoint[0] < xCenter) {
            if (centerPoint[1] < yCenter) {
                direction.push('top');
            } else {
                direction.push('bottom');
            }
        }
        return direction;
    }

    if (centerPoint[0] > xCenter && centerPoint[0] < right && centerPoint[1] > y && centerPoint[1] < y + height) {
        const direction: DetectResult[] = ['right'];
        if (centerPoint[0] > xCenter && centerPoint[0] < x + width) {
            if (centerPoint[1] < yCenter) {
                direction.push('top');
            } else {
                direction.push('bottom');
            }
        }
        return direction;
    }
    if (centerPoint[0] > x && centerPoint[0] < x + width && centerPoint[1] > top && centerPoint[1] < yCenter) {
        const direction: DetectResult[] = ['top'];
        if (centerPoint[1] > y && centerPoint[1] < y + height) {
            if (centerPoint[0] < xCenter) {
                direction.push('left');
            } else {
                direction.push('right');
            }
        }
        return direction;
    }
    if (centerPoint[0] > x && centerPoint[0] < x + width && centerPoint[1] > yCenter && centerPoint[1] < bottom) {
        const direction: DetectResult[] = ['bottom'];
        if (centerPoint[1] > yCenter && centerPoint[1] < y + height) {
            if (centerPoint[0] < xCenter) {
                direction.push('left');
            } else {
                direction.push('right');
            }
        }
        return direction;
    }

    return null;
};
