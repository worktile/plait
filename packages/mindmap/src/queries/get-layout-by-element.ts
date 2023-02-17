import { MindmapNodeElement } from '../interfaces';
import { MindmapLayoutType } from '@plait/layouts';
import { getLayoutParentByElement } from './get-layout-parent-by-element';

export const getLayoutByElement = (element: MindmapNodeElement): MindmapLayoutType => {
    const layout = element.layout;
    if (layout) {
        return layout;
    }
    return getLayoutParentByElement(element);
};
