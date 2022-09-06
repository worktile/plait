import { LayoutDirection, LayoutDirectionsMap, MindmapElement } from '../interfaces';
import { findParentElement, findUpElement } from './mindmap';
import { MindmapLayoutType } from '@plait/layouts';
import { MINDMAP_ELEMENT_TO_COMPONENT } from './weak-maps';

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
    return getDefaultMindmapLayout();
};

/**
 * 获取正确的布局类型：
 * 1. 假如根布局是 Standard、则子节点需要被定位左布局或右布局
 * 2. 假如子节点的布局被纠正则返回纠正后的布局
 * @param element
 */
export const getCorrectLayoutByElement = (element: MindmapElement) => {
    const component = MINDMAP_ELEMENT_TO_COMPONENT.get(element);
    const layout = component?.node.origin.layout;
    const { root } = findUpElement(element);
    // 反方向布局纠正
    if (layout) {
        const incorrectDirection = getInCorrectLayout(root, layout);
        if (incorrectDirection) {
            return correctLayoutByDirection(layout, incorrectDirection);
        }
    }
};

export const isCorrectLayout = (root: MindmapElement, layout: MindmapLayoutType) => {
    return !getInCorrectLayout(root, layout);
}

export const getInCorrectLayout = (root: MindmapElement, layout: MindmapLayoutType) => {
    const mindmapDirections = getMindmapDirection(root);
    const subLayoutDirections = LayoutDirectionsMap[layout];
    return subLayoutDirections.find(d => mindmapDirections.includes(getLayoutReverseDirection(d)));
}

export const correctLayoutByDirection = (layout: MindmapLayoutType, direction: LayoutDirection) => {
    const isHorizontal = direction === LayoutDirection.left || direction === LayoutDirection.right ? true : false;
    let inverseDirectionLayout = MindmapLayoutType.standard;
    switch (layout) {
        case MindmapLayoutType.left:
            inverseDirectionLayout = MindmapLayoutType.right;
            break;
        case MindmapLayoutType.right:
            inverseDirectionLayout = MindmapLayoutType.left;
            break;
        case MindmapLayoutType.downward:
            inverseDirectionLayout = MindmapLayoutType.upward;
            break;
        case MindmapLayoutType.downward:
            inverseDirectionLayout = MindmapLayoutType.upward;
            break;
        case MindmapLayoutType.rightBottomIndented:
            inverseDirectionLayout = isHorizontal ? MindmapLayoutType.leftBottomIndented : MindmapLayoutType.rightTopIndented;
            break;
        case MindmapLayoutType.leftBottomIndented:
            inverseDirectionLayout = isHorizontal ? MindmapLayoutType.rightBottomIndented : MindmapLayoutType.leftTopIndented;
            break;
        case MindmapLayoutType.rightTopIndented:
            inverseDirectionLayout = isHorizontal ? MindmapLayoutType.leftTopIndented : MindmapLayoutType.rightBottomIndented;
            break;
        case MindmapLayoutType.leftTopIndented:
            inverseDirectionLayout = isHorizontal ? MindmapLayoutType.rightTopIndented : MindmapLayoutType.leftBottomIndented;
            break;
    }
    return inverseDirectionLayout;
};

export const getMindmapDirection = (root: MindmapElement) => {
    const layout = root.layout || getDefaultMindmapLayout();
    return LayoutDirectionsMap[layout];
};

export const getDefaultMindmapLayout = () => {
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
        if (layoutDirections) {
            // handle standrad
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
