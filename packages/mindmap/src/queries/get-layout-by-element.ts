import { MindElement } from '../interfaces';
import { MindmapLayoutType } from '@plait/layouts';
import { getLayoutParentByElement } from './get-layout-parent-by-element';

export const getLayoutByElement = (element: MindElement): MindmapLayoutType => {
    const layout = element.layout;
    if (layout) {
        return layout;
    }
    return getLayoutParentByElement(element);
};
