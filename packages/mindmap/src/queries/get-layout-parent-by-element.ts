import { MindmapNodeElement } from '../interfaces';
import { findParentElement, getDefaultMindmapLayout } from '../utils';
import { MindmapLayoutType } from '@plait/layouts';

/**
 * 获取父节点布局类型
 * @param element
 * @returns MindmapLayoutType
 */
export const getLayoutParentByElement = (element: MindmapNodeElement): MindmapLayoutType => {
    let parent = findParentElement(element);
    while (parent) {
        if (parent.layout) {
            return parent.layout;
        }
        parent = findParentElement(parent);
    }
    return getDefaultMindmapLayout();
};
