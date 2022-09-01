import { MindmapElement } from "../interfaces";
import { findParentElement } from "./mindmap";
import { MindmapLayoutType } from '@plait/layouts';

export const getLayoutByElement = (element: MindmapElement): MindmapLayoutType => {
    let layout = element.layout;
    if (layout) {
        return layout;
    }
    let parent = findParentElement(element);
    while (parent) {
        if (parent.layout) {
            return parent.layout;
        }
        parent = findParentElement(parent);
    }
    return MindmapLayoutType.standard;
};

/**
 * 获取指定布局下允许的子布局
 * @param layout 
 */
export const getAvailableSubLayouts = (layout: MindmapLayoutType) => {

}

/**
 * 更新父级布局后，修正子级布局
 * @param parentLayout 
 * @param target 
 */
export const correctUnavailableLayout = (parentLayout: MindmapLayoutType, target: MindmapLayoutType) => {

}