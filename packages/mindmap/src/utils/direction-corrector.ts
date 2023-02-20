import { DetectResult, MindmapNodeElement, MindmapNode } from '../interfaces';
import { isBottomLayout, isRightLayout, isLeftLayout, MindmapLayoutType, isStandardLayout, isTopLayout } from '@plait/layouts';
import { MindmapQueries } from '../queries';

export const directionCorrector = (node: MindmapNode, detectResults: DetectResult[]): DetectResult[] | null => {
    if (!node.origin.isRoot) {
        const parentlayout = MindmapQueries.getCorrectLayoutByElement(node?.parent.origin as MindmapNodeElement);
        if (isStandardLayout(parentlayout)) {
            const idx = node.parent.children.findIndex(x => x === node);
            const isLeft = idx >= (node.parent.origin.rightNodeCount || 0);
            return getAllowedDirection(detectResults, [isLeft ? 'right' : 'left']);
        }

        if (isLeftLayout(parentlayout)) {
            return getAllowedDirection(detectResults, ['right']);
        }

        if (isRightLayout(parentlayout)) {
            return getAllowedDirection(detectResults, ['left']);
        }

        if (parentlayout === MindmapLayoutType.upward) {
            return getAllowedDirection(detectResults, ['bottom']);
        }

        if (parentlayout === MindmapLayoutType.downward) {
            return getAllowedDirection(detectResults, ['top']);
        }
    } else {
        const layout = MindmapQueries.getCorrectLayoutByElement(node?.origin as MindmapNodeElement);
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
