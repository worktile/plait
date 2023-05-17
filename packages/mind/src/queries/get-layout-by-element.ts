import { MindElement, PlaitMind } from '../interfaces';
import { AbstractNode, MindLayoutType, getAbstractLayout } from '@plait/layouts';
import { getDefaultLayout } from '../utils/layout';

export const getLayoutByElement = (element: MindElement): MindLayoutType => {
    const layout = element.layout;
    if (layout) {
        return layout;
    }

    const parent = !PlaitMind.isMind(element) && MindElement.getParent(element);

    if (AbstractNode.isAbstract(element) && parent) {
        return getAbstractLayout(getLayoutByElement(parent));
    }

    if (parent) {
        return getLayoutByElement(parent);
    }

    return getDefaultLayout();
};
