import { LayoutDirection, LayoutDirectionsMap, MindmapElement } from '../interfaces';
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
    const result = [];
    const direction = new Set();

    const layoutDirections = (LayoutDirectionsMap as { [key: string]: LayoutDirection[] })[layout];
    for (let [layoutType, directionType] of Object.entries(LayoutDirectionsMap)) {
        if (!layoutDirections.find(it => directionType.includes(it))) {
            !direction.has(layoutType) && direction.add(layoutType);
        }
    }

    for (const key in MindmapLayoutType) {
        const layout: MindmapLayoutType = (MindmapLayoutType as { [key: string]: MindmapLayoutType })[key];
        if (!['standard', ...direction].includes(layout)) {
            result.push(layout);
        }
    }

    return result;
};

/**
 * 更新父级布局后，修正子级布局
 * @param parentLayout
 * @param target
 */
export const correctUnavailableLayout = (parentLayout: MindmapLayoutType, target: MindmapLayoutType) => {};
