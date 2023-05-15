import { PlaitElement } from '@plait/core';
import { MindElement } from '../interfaces';
import { MindNodeComponent } from '../node.component';
import { correctLayoutByDirection, findUpElement, getDefaultLayout, getInCorrectLayoutDirection } from '../utils';
import { AbstractNode, LayoutNode, MindLayoutType, getAbstractLayout, isChildOfAbstract } from '@plait/layouts';
import { getLayoutByElement } from './get-layout-by-element';

/**
 * get correctly layout：
 * 1. root is standard -> left or right
 * 2. correct layout by incorrect layout direction
 * @param element
 */
export const getCorrectLayoutByElement = (element: MindElement) => {
    const { root } = findUpElement(element);
    const rootLayout = root.layout || getDefaultLayout();
    let correctRootLayout = rootLayout;

    if (element.isRoot) {
        return correctRootLayout;
    }

    const component = PlaitElement.getComponent(element) as MindNodeComponent;
    let layout = element.layout;

    let parentComponent: MindNodeComponent | null = null;
    let parent: MindElement | undefined = component.parent.origin;

    while (!layout && parent) {
        parentComponent = PlaitElement.getComponent(parent) as MindNodeComponent;
        layout = parentComponent.node.origin.layout;
        parent = parentComponent.parent?.origin;
    }

    if (
        AbstractNode.isAbstract(element) ||
        (!element.layout && isChildOfAbstract((MindElement.getNode(element) as unknown) as LayoutNode))
    ) {
        return getLayoutByElement(element);
    }

    // handle root standard
    if (rootLayout === MindLayoutType.standard) {
        correctRootLayout = component?.node.left ? MindLayoutType.left : MindLayoutType.right;
    }

    if (parentComponent && parentComponent.node.origin.isRoot) {
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
