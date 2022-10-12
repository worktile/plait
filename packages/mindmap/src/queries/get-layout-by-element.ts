import { MindmapElement } from '../interfaces';
import { MindmapLayoutType } from '@plait/layouts';
import { getLayoutParentByElement } from './get-layout-parent-by-element';

export const getLayoutByElement = (element: MindmapElement): MindmapLayoutType => {
    const layout = element.layout;
    if (layout) {
        return layout;
    }
    return getLayoutParentByElement(element);
};
