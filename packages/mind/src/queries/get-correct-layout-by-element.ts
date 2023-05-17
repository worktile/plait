import { PlaitBoard } from '@plait/core';
import { MindElement, PlaitMind } from '../interfaces';
import { correctLayoutByDirection, getInCorrectLayoutDirection, getRootLayout } from '../utils';
import { AbstractNode, MindLayoutType, getAbstractLayout } from '@plait/layouts';

/**
 * get correctly layout：
 * 1. root is standard -> left or right
 * 2. correct layout by incorrect layout direction
 * @param element
 */
export const getCorrectLayoutByElement = (board: PlaitBoard, element: MindElement) => {
    const ancestors = MindElement.getAncestors(board, element) as MindElement[];
    ancestors.unshift(element);
    const root = ancestors[ancestors.length - 1];
    let rootLayout = getRootLayout(root);

    if (PlaitMind.isMind(element)) {
        return rootLayout;
    }

    const node = MindElement.getNode(element);
    let correctRootLayout = rootLayout;
    if (rootLayout === MindLayoutType.standard) {
        correctRootLayout = node.left ? MindLayoutType.left : MindLayoutType.right;
    }

    let layout = null;
    const elementWithLayout = ancestors.find(value => value.layout || AbstractNode.isAbstract(value));
    if (elementWithLayout) {
        if (AbstractNode.isAbstract(elementWithLayout)) {
            const parent = MindElement.getParent(elementWithLayout);
            const parentLayout = getCorrectLayoutByElement(board, parent);
            layout = getAbstractLayout(parentLayout);
        } else {
            layout = elementWithLayout?.layout;
        }
    }

    if (layout === MindLayoutType.standard || !layout) {
        return correctRootLayout;
    } else {
        const incorrectDirection = getInCorrectLayoutDirection(correctRootLayout, layout);
        if (incorrectDirection) {
            return correctLayoutByDirection(layout, incorrectDirection);
        } else {
            return layout;
        }
    }
};
