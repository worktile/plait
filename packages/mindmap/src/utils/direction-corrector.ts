import { DetectResult, MindmapElement, MindmapNode } from '../interfaces';
import { isBottomLayout, isRightLayout, isLeftLayout, MindmapLayoutType, isStandardLayout, isTopLayout } from '@plait/layouts';
import { getCorrectLayoutByElement } from '../queries';

export const directionCorrector = (node: MindmapNode, detectResults: DetectResult[]): DetectResult[] | null => {
    const layout = getCorrectLayoutByElement(node?.origin as MindmapElement);

    if (!node.origin.isRoot) {
        if (isLeftLayout(layout)) {
            return getAllowedDirection(detectResults, ['right']);
        }

        if (isRightLayout(layout)) {
            return getAllowedDirection(detectResults, ['left']);
        }

        if (layout === MindmapLayoutType.upward) {
            return getAllowedDirection(detectResults, ['bottom']);
        }

        if (layout === MindmapLayoutType.downward) {
            return getAllowedDirection(detectResults, ['top']);
        }
    } else {
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
