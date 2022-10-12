import { MindmapElement } from '../interfaces';
import { findParentElement } from '../utils';
import { MindmapLayoutType } from '@plait/layouts';

export const getBranchMindmapLayouts = (element: MindmapElement) => {
    const layouts: MindmapLayoutType[] = [];
    if (element.layout) {
        layouts.unshift(element.layout);
    }
    let parent = findParentElement(element);
    while (parent) {
        if (parent.layout) {
            layouts.unshift(parent.layout);
        }
        parent = findParentElement(parent);
    }
    return layouts;
};
