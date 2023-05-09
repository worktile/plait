import { MindElement } from '../interfaces';
import { AbstractNode, MindLayoutType, getAbstractLayout, isIndentedLayout, isChildOfAbstract, LayoutNode } from '@plait/layouts';
import { getLayoutParentByElement } from './get-layout-parent-by-element';

export const getLayoutByElement = (element: MindElement): MindLayoutType => {
    const layout = element.layout;
    if (layout) {
        return layout;
    }

    if (
        AbstractNode.isAbstract(element) ||
        (isChildOfAbstract((MindElement.getNode(element) as unknown) as LayoutNode) && isIndentedLayout(layout!))
    ) {
        const parentLayout = getLayoutParentByElement(element);
        return getAbstractLayout(parentLayout);
    }
    return getLayoutParentByElement(element);
};
