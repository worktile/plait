import { MindmapElement } from '../interfaces';
import { findParentElement } from '../utils';
import { MindmapLayoutType } from '@plait/layouts';
import { getCorrectLayoutByElement } from './get-correct-layout-by-element';

export const getBranchMindmapLayouts = (element: MindmapElement) => {
    const layouts: MindmapLayoutType[] = [];
    if (element.layout) {
        layouts.unshift(getCorrectLayoutByElement(element));
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
