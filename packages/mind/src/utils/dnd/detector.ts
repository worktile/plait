import { MindElement, PlaitMind } from '../../interfaces/element';
import { PlaitBoard, Point, depthFirstRecursion, Path } from '@plait/core';
import { DetectResult, MindNode } from '../../interfaces/node';
import { getRectangleByNode } from '../position/node';
import { MindQueries } from '../../queries';
import { getRootLayout } from '../layout';
import {
    MindLayoutType,
    getNonAbstractChildren,
    isHorizontalLogicLayout,
    isIndentedLayout,
    isStandardLayout,
    isTopLayout,
    isVerticalLogicLayout
} from '@plait/layouts';
import { isBottomLayout, isRightLayout, isLeftLayout, AbstractNode } from '@plait/layouts';
import { isChildElement } from '../mind';

export const directionCorrector = (board: PlaitBoard, node: MindNode, detectResults: DetectResult[]): DetectResult[] | null => {
    if (!node.origin.isRoot && !AbstractNode.isAbstract(node.origin)) {
        const parentLayout = MindQueries.getCorrectLayoutByElement(board, node?.parent.origin as MindElement);
        if (isStandardLayout(parentLayout)) {
            const idx = node.parent.children.findIndex(x => x === node);
            const isLeft = idx >= (node.parent.origin.rightNodeCount || 0);
            return getAllowedDirection(detectResults, [isLeft ? 'right' : 'left']);
        }

        if (isLeftLayout(parentLayout)) {
            return getAllowedDirection(detectResults, ['right']);
        }

        if (isRightLayout(parentLayout)) {
            return getAllowedDirection(detectResults, ['left']);
        }

        if (parentLayout === MindLayoutType.upward) {
            return getAllowedDirection(detectResults, ['bottom']);
        }

        if (parentLayout === MindLayoutType.downward) {
            return getAllowedDirection(detectResults, ['top']);
        }
    } else {
        const layout = MindQueries.getCorrectLayoutByElement(board, node?.origin as MindElement);
        if (isStandardLayout(layout)) {
            return getAllowedDirection(detectResults, ['top', 'bottom']);
        }

        if (layout === MindLayoutType.upward) {
            return getAllowedDirection(detectResults, ['left', 'right', 'bottom']);
        }

        if (layout === MindLayoutType.downward) {
            return getAllowedDirection(detectResults, ['left', 'right', 'top']);
        }

        if (isLeftLayout(layout)) {
            return getAllowedDirection(detectResults, ['right', 'top', 'bottom']);
        }

        if (isRightLayout(layout)) {
            return getAllowedDirection(detectResults, ['left', 'top', 'bottom']);
        }
    }

    return null;
};

export const getAllowedDirection = (detectResults: DetectResult[], illegalDirections: DetectResult[]): DetectResult[] | null => {
    const directions = detectResults;
    illegalDirections.forEach(item => {
        const bottomDirectionIndex = directions.findIndex(direction => direction === item);
        if (bottomDirectionIndex !== -1) {
            directions.splice(bottomDirectionIndex, 1);
        }
    });
    return directions.length ? directions : null;
};

export const detectDropTarget = (
    board: PlaitBoard,
    detectPoint: Point,
    dropTarget: { target: MindElement; detectResult: DetectResult } | null,
    activeElements: MindElement[]
) => {
    let detectResult: DetectResult[] | null = null;
    depthFirstRecursion(
        (board as unknown) as MindElement,
        element => {
            if (!MindElement.isMindElement(board, element) || detectResult) {
                return;
            }
            const node = MindElement.getNode(element);
            const directions = directionDetector(node, detectPoint);
            if (directions) {
                detectResult = directionCorrector(board, node, directions);
            }
            dropTarget = null;
            const isValid = activeElements.every(element => isValidTarget(element, node.origin));
            if (detectResult && isValid) {
                dropTarget = { target: node.origin, detectResult: detectResult[0] };
            }
        },
        node => {
            if (PlaitBoard.isBoard(node) || board.isRecursion(node)) {
                return true;
            } else {
                return false;
            }
        }
    );
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

export const isValidTarget = (origin: MindElement, target: MindElement) => {
    return origin !== target && !isChildElement(origin, target);
};

export const getPathByDropTarget = (board: PlaitBoard, dropTarget: { target: MindElement; detectResult: DetectResult }) => {
    let targetPath = PlaitBoard.findPath(board, dropTarget?.target);
    const layout = PlaitMind.isMind(dropTarget?.target)
        ? getRootLayout(dropTarget?.target)
        : MindQueries.getCorrectLayoutByElement(board, MindElement.getParent(dropTarget?.target));
    const children = getNonAbstractChildren(dropTarget.target);
    // 上下布局：左右是兄弟节点，上下是子节点
    if (isVerticalLogicLayout(layout)) {
        if (dropTarget.detectResult === 'top' || dropTarget.detectResult === 'bottom') {
            targetPath.push(children.length);
        }
        // 如果是左，位置不变，右则插入到下一个兄弟节点
        if (dropTarget.detectResult === 'right') {
            targetPath = Path.next(targetPath);
        }
    }
    // 水平布局/标准布局：上下是兄弟节点，左右是子节点
    if (isHorizontalLogicLayout(layout)) {
        if (dropTarget.detectResult === 'right') {
            if (PlaitMind.isMind(dropTarget?.target) && isStandardLayout(layout)) {
                targetPath.push(dropTarget?.target.rightNodeCount!);
            } else {
                targetPath.push(children.length);
            }
        }
        if (dropTarget.detectResult === 'left') {
            targetPath.push(children.length);
        }
        // 如果是上，位置不变，下插入到下一个兄弟节点
        if (dropTarget.detectResult === 'bottom') {
            targetPath = Path.next(targetPath);
        }
    }

    // 缩进布局：上下是兄弟节点，左右是子节点，但上（左上/右上），探测到上是子节点，下则位置不变，反之同理。
    if (isIndentedLayout(layout)) {
        if (isTopLayout(layout) && dropTarget.detectResult === 'top') {
            targetPath = Path.next(targetPath);
        }
        if (isBottomLayout(layout) && dropTarget.detectResult === 'bottom') {
            targetPath = Path.next(targetPath);
        }
        if (isLeftLayout(layout) && dropTarget.detectResult === 'left') {
            targetPath.push(children.length);
        }
        if (isRightLayout(layout) && dropTarget.detectResult === 'right') {
            targetPath.push(children.length);
        }
    }
    return targetPath;
};
