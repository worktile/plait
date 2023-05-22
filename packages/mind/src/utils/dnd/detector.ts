import { MindElement } from '../../interfaces/element';
import { PlaitBoard, ELEMENT_TO_COMPONENT, PlaitElement, Point } from '@plait/core';
import { PlaitMind } from '../../interfaces/element';
import { DetectResult, MindNode } from '../../interfaces/node';
import { PlaitMindComponent } from '../../mind.component';
import { directionCorrector } from './direction';
import { isValidTarget } from './common';
import { getRectangleByNode } from '../graph';

export const detectDropTarget = (
    board: PlaitBoard,
    detectPoint: Point,
    dropTarget: { target: MindElement; detectResult: DetectResult } | null,
    activeElement: MindElement
) => {
    let detectResult: DetectResult[] | null = null;
    board.children.forEach((value: PlaitElement) => {
        if (detectResult) {
            return;
        }
        if (PlaitMind.isMind(value)) {
            const mindComponent = ELEMENT_TO_COMPONENT.get(value) as PlaitMindComponent;
            const root = mindComponent?.root;

            (root as any).eachNode((node: MindNode) => {
                if (detectResult) {
                    return;
                }
                const directions = directionDetector(node, detectPoint);

                if (directions) {
                    detectResult = directionCorrector(board, node, directions);
                }
                dropTarget = null;
                if (detectResult && isValidTarget(activeElement, node.origin)) {
                    dropTarget = { target: node.origin, detectResult: detectResult[0] };
                }
            });
        }
    });

    return dropTarget;
};

export const directionDetector = (targetNode: MindNode, centerPoint: Point): DetectResult[] | null => {
    const { x, y, width, height } = getRectangleByNode(targetNode);
    const yCenter = y + height / 2;
    const xCenter = x + width / 2;

    const top = targetNode.y;
    const bottom = targetNode.y + targetNode.height;
    const left = targetNode.x;
    const right = targetNode.x + targetNode.width;
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
