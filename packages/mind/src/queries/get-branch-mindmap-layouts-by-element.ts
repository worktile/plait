import { MindElement } from '../interfaces';
import { findParentElement } from '../utils';
import { MindLayoutType } from '@plait/layouts';
import { getCorrectLayoutByElement } from './get-correct-layout-by-element';

export const getBranchMindmapLayouts = (element: MindElement) => {
    const layouts: MindLayoutType[] = [];
    if (element.layout) {
        //getCorrectLayoutByElement含有递归操作，getBranchMindmapLayouts本身也有递归操作，有待优化
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
