import { NODE_TO_PARENT, PlaitBoard } from '@plait/core';
import { MindmapNode, MindmapNodeElement } from '../interfaces';
import { MindmapNodeComponent } from '../node.component';
import {
    ELEMENT_TO_NODE,
    correctLayoutByDirection,
    findMindmap,
    getDefaultMindmapLayout,
    getInCorrectLayoutDirection
} from '../utils';
import { MindmapLayoutType } from '@plait/layouts';

/**
 * get correctly layout：
 * 1. root is standard -> left or right
 * 2. correct layout by incorrect layout direction
 */
export const getCorrectLayoutByElement = (board: PlaitBoard, element: MindmapNodeElement) => {
    const root = findMindmap(board, element);
    const node = ELEMENT_TO_NODE.get(element) as MindmapNode;
    const rootLayout = root.layout || getDefaultMindmapLayout();
    let correctRootLayout = rootLayout;

    if (element.isRoot) {
        return correctRootLayout;
    }

    let layout = element.layout;
    let parent = NODE_TO_PARENT.get(element) as MindmapNodeElement;
    let ancestor = parent;
    while (!layout && ancestor) {
        layout = ancestor.layout;
        ancestor = NODE_TO_PARENT.get(element) as MindmapNodeElement;
        if (ancestor) {
            parent = ancestor;
        }
    }

    // handle root standard
    if (rootLayout === MindmapLayoutType.standard) {
        correctRootLayout = node.left ? MindmapLayoutType.left : MindmapLayoutType.right;
    }

    if (parent.isRoot) {
        return correctRootLayout;
    }

    if (layout) {
        const incorrectDirection = getInCorrectLayoutDirection(correctRootLayout, layout);
        if (incorrectDirection) {
            return correctLayoutByDirection(layout, incorrectDirection);
        } else {
            return layout;
        }
    } else {
        return correctRootLayout;
    }
};
