import { DetectResult, MindElement, MindNode } from '../interfaces';
import { isBottomLayout, isRightLayout, isLeftLayout, MindLayoutType, isStandardLayout, isTopLayout } from '@plait/layouts';
import { MindQueries } from '../queries';

export const directionCorrector = (node: MindNode, detectResults: DetectResult[]): DetectResult[] | null => {
    if (!node.origin.isRoot) {
        const parentlayout = MindQueries.getCorrectLayoutByElement(node?.parent.origin as MindElement);
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

        if (parentlayout === MindLayoutType.upward) {
            return getAllowedDirection(detectResults, ['bottom']);
        }

        if (parentlayout === MindLayoutType.downward) {
            return getAllowedDirection(detectResults, ['top']);
        }
    } else {
        const layout = MindQueries.getCorrectLayoutByElement(node?.origin as MindElement);
        if (isStandardLayout(layout)) {
            return getAllowedDirection(detectResults, ['top', 'bottom']);
        }

        if (isTopLayout(layout)) {
            return getAllowedDirection(detectResults, ['left', 'right', 'bottom']);
        }

        if (isBottomLayout(layout)) {
            return getAllowedDirection(detectResults, ['left', 'right', 'top']);
        }

        if (layout === MindLayoutType.left) {
            return getAllowedDirection(detectResults, ['right', 'top', 'bottom']);
        }

        if (layout === MindLayoutType.right) {
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
