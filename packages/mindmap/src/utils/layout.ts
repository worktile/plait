import { LayoutDirection, LayoutDirectionsMap, LayoutTypeMap, MindmapElement } from '../interfaces';
import { findParentElement } from './mindmap';
import { MindmapLayoutType } from '@plait/layouts';

export const getLayoutByElement = (element: MindmapElement): MindmapLayoutType => {
    const layout = element.layout;
    if (layout) {
        return layout;
    }
    return getLayoutParentByElement(element);
};

/**
 * 获取父节点布局类型
 * @param element
 * @returns MindmapLayoutType
 */
export const getLayoutParentByElement = (element: MindmapElement): MindmapLayoutType => {
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
 * @returns MindmapLayoutType[]
 */
export const getAvailableSubLayouts = (layout: MindmapLayoutType): MindmapLayoutType[] => {
    let result = new Set();
    const res = new Set();
    (LayoutDirectionsMap as { [key: string]: LayoutDirection[] })[layout].map((direction, i) => {
        const layouts = (LayoutTypeMap as { [key: string]: MindmapLayoutType[] })[direction];
        if (i) {
            for (let layout of layouts) {
                result.has(layout) && res.add(layout);
            }
        }
        result = new Set(layouts);
    });
    return (res.size ? [...res] : [...result]) as MindmapLayoutType[];
};

/**
 * 更新父级布局后，修正子级布局
 * @param parentLayout
 * @param target
 */
export const correctUnavailableLayout = (parentLayout: MindmapLayoutType, target: MindmapLayoutType) => {};
