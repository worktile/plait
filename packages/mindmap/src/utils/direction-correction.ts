import { DetectResult, MindmapElement, MindmapNode } from '../interfaces';
import { isRightLayout, isLeftLayout, MindmapLayoutType, isStandardLayout } from '@plait/layouts';
import { getCorrectLayoutByElement } from './layout';

export const directionCorrection = (node: MindmapNode, detectResults: DetectResult[]): DetectResult[] | null => {
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

        if ([MindmapLayoutType.upward, MindmapLayoutType.downward].includes(layout)) {
            return getAllowedDirection(detectResults, ['left', 'top', 'bottom']);
        }

        if ([MindmapLayoutType.left, MindmapLayoutType.right].includes(layout)) {
            return getAllowedDirection(detectResults, ['left', 'right', 'top']);
        }

        if ([MindmapLayoutType.leftBottomIndented, MindmapLayoutType.rightBottomIndented].includes(layout)) {
            return getAllowedDirection(detectResults, ['left', 'right', 'top']);
        }

        if ([MindmapLayoutType.leftTopIndented, MindmapLayoutType.rightTopIndented].includes(layout)) {
            return getAllowedDirection(detectResults, ['left', 'right', 'bottom']);
        }
    }

    return null;
};

export const getAllowedDirection = (detectResults: DetectResult[], illegalDirections: DetectResult[]): DetectResult[] | null => {
    illegalDirections.forEach(item => {
        const bottomDirectionIndex = detectResults.findIndex(direction => direction === item);
        if (bottomDirectionIndex !== -1) {
            detectResults.splice(bottomDirectionIndex, 1);
        }
    });
    return detectResults.length ? detectResults : null;
};
