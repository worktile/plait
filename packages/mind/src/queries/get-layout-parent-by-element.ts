import { MindElement } from '../interfaces';
import { findParentElement, getDefaultMindmapLayout } from '../utils';
import { MindLayoutType } from '@plait/layouts';

/**
 * 获取父节点布局类型
 * @param element
 * @returns MindLayoutType
 */
export const getLayoutParentByElement = (element: MindElement): MindLayoutType => {
    let parent = findParentElement(element);
    while (parent) {
        if (parent.layout) {
            return parent.layout;
        }
        parent = findParentElement(parent);
    }
    return getDefaultMindmapLayout();
};
