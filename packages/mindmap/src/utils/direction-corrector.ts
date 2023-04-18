import { DetectResult, MindmapNodeElement } from '../interfaces';
import { isBottomLayout, isRightLayout, isLeftLayout, MindmapLayoutType, isStandardLayout, isTopLayout } from '@plait/layouts';
import { MindmapQueries } from '../queries';
import { NODE_TO_PARENT, PlaitBoard } from '@plait/core';

export const directionCorrector = (board: PlaitBoard, element: MindmapNodeElement, detectResults: DetectResult[]): DetectResult[] | null => {
    if (!element.isRoot) {
        const parent = NODE_TO_PARENT.get(element) as MindmapNodeElement;
        const parentLayout = MindmapQueries.getCorrectLayoutByElement(board, parent);
        if (isStandardLayout(parentLayout)) {
            const idx = parent.children.findIndex(x => x === element);
            const isLeft = idx >= (parent.rightNodeCount || 0);
            return getAllowedDirection(detectResults, [isLeft ? 'right' : 'left']);
        }

        if (isLeftLayout(parentLayout)) {
            return getAllowedDirection(detectResults, ['right']);
        }

        if (isRightLayout(parentLayout)) {
            return getAllowedDirection(detectResults, ['left']);
        }

        if (parentLayout === MindmapLayoutType.upward) {
            return getAllowedDirection(detectResults, ['bottom']);
        }

        if (parentLayout === MindmapLayoutType.downward) {
            return getAllowedDirection(detectResults, ['top']);
        }
    } else {
        const layout = MindmapQueries.getCorrectLayoutByElement(board, element);
        if (isStandardLayout(layout)) {
            return getAllowedDirection(detectResults, ['top', 'bottom']);
        }

        if (isTopLayout(layout)) {
            return getAllowedDirection(detectResults, ['left', 'right', 'bottom']);
        }

        if (isBottomLayout(layout)) {
            return getAllowedDirection(detectResults, ['left', 'right', 'top']);
        }

        if (layout === MindmapLayoutType.left) {
            return getAllowedDirection(detectResults, ['right', 'top', 'bottom']);
        }

        if (layout === MindmapLayoutType.right) {
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
