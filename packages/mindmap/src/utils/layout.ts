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
    const result: MindmapLayoutType[] = [];
    const layoutReverseDirections = LayoutDirectionsMap[layout].map(getLayoutReverseDirection);
    for (const key in MindmapLayoutType) {
        const layout = MindmapLayoutType[key as keyof typeof MindmapLayoutType];
        const layoutDirections = LayoutDirectionsMap[layout];
        if (layoutDirections) { // handle standrad
            const exist = layoutDirections.some(d => layoutReverseDirections.includes(d));
            if (!exist) {
                result.push(layout);
            }
        }
        
    }
    return result;
};

export const getLayoutReverseDirection = (layoutDirection: LayoutDirection) => {
    let reverseDirection = LayoutDirection.right;
    switch (layoutDirection) {
        case LayoutDirection.top:
            reverseDirection = LayoutDirection.bottom;
            break;
        case LayoutDirection.bottom:
            reverseDirection = LayoutDirection.top;
            break;
        case LayoutDirection.right:
            reverseDirection = LayoutDirection.left;
            break;
        case LayoutDirection.left:
            reverseDirection = LayoutDirection.right;
            break;
    }
    return reverseDirection;
};

/**
 * 更新父级布局后，修正子级布局
 * @param parentLayout
 * @param target
 */
export const correctUnavailableLayout = (parentLayout: MindmapLayoutType, target: MindmapLayoutType) => {};
