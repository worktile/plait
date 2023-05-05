import { MindElement } from '../interfaces';
import { AbstractNode, MindmapLayoutType, getAbstractLayout, isIndentedLayout, isChildOfAbstract, LayoutNode } from '@plait/layouts';
import { getLayoutParentByElement } from './get-layout-parent-by-element';

export const getLayoutByElement = (element: MindElement): MindmapLayoutType => {
    const layout = element.layout;
    if (layout) {
        return layout;
    }

    if (
        AbstractNode.isAbstract(element) ||
        (isChildOfAbstract((MindElement.getNode(element) as unknown) as LayoutNode) && isIndentedLayout(layout!))
    ) {
        // console.log('=======2=======', 2);
        const parentLayout = getLayoutParentByElement(element);
        return getAbstractLayout(parentLayout);
    }
    return getLayoutParentByElement(element);
};
