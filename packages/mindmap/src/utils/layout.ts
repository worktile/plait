import { LayoutDirection, LayoutDirectionsMap, MindmapElement } from '../interfaces';
import { findParentElement, findUpElement } from './mindmap';
import { MindmapLayoutType } from '@plait/layouts';
import { MINDMAP_ELEMENT_TO_COMPONENT } from './weak-maps';
import { MindmapNodeComponent } from '../node.component';

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
 * get correctly layout：
 * 1. root is standard -> left or right
 * 2. correct layout by incorrect layout direction
 * @param element
 */
export const getCorrectLayoutByElement = (element: MindmapElement) => {
    const { root } = findUpElement(element);
    const rootLayout = root.layout || getDefaultMindmapLayout();
    let correctRootLayout = rootLayout;

    if (element.isRoot) {
        return correctRootLayout;
    }

    const component = MINDMAP_ELEMENT_TO_COMPONENT.get(element);
    let layout = component?.node.origin.layout;

    let parentComponent: undefined | MindmapNodeComponent;
    let parent: MindmapElement | undefined = component?.parent?.origin;

    while (!layout && parent) {
        parentComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(parent);
        layout = parentComponent?.node.origin.layout;
        parent = parentComponent?.parent?.origin;
    }

    // handle root standard
    if (rootLayout === MindmapLayoutType.standard) {
        correctRootLayout = component?.node.left ? MindmapLayoutType.left : MindmapLayoutType.right;
    }

    if (parentComponent?.node.origin.isRoot) {
        return correctRootLayout;
    }

    if (layout) {
        const incorrectDirection = getInCorrectLayoutDirection(correctRootLayout, layout);
        if (incorrectDirection) {
            return correctLayoutByDirection(layout, incorrectDirection);
        } else {
            return layout;
        }
    } else {
        return correctRootLayout;
    }
};

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

export const getBranchDirectionsByLayouts = (branchLayouts: MindmapLayoutType[]) => {
    const branchDirections: LayoutDirection[] = [];
    branchLayouts.forEach(l => {
        const directions = LayoutDirectionsMap[l];
        directions.forEach(d => {
            if (!branchDirections.includes(d) && !branchDirections.includes(getLayoutReverseDirection(d))) {
                branchDirections.push(d);
            }
        });
    });
    return branchDirections;
};

export const isCorrectLayout = (root: MindmapElement, layout: MindmapLayoutType) => {
    const rootLayout = root.layout || getDefaultMindmapLayout();
    return !getInCorrectLayoutDirection(rootLayout, layout);
};

export const getInCorrectLayoutDirection = (rootLayout: MindmapLayoutType, layout: MindmapLayoutType) => {
    const mindmapDirections = LayoutDirectionsMap[rootLayout];
    const subLayoutDirections = LayoutDirectionsMap[layout];
    return subLayoutDirections.find(d => mindmapDirections.includes(getLayoutReverseDirection(d)));
};

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
 * get available sub layouts
 * @param layout
 * @returns MindmapLayoutType[]
 */
export const getAvailableSubLayouts = (layout: MindmapLayoutType): MindmapLayoutType[] => {
    const currentLayoutDirections = LayoutDirectionsMap[layout];
    return getAvailableSubLayoutsByLayoutDirections(currentLayoutDirections);
};

export const getAvailableSubLayoutsByLayoutDirections = (directions: LayoutDirection[]): MindmapLayoutType[] => {
    const result: MindmapLayoutType[] = [];
    const reverseDirections = directions.map(getLayoutReverseDirection);
    for (const key in MindmapLayoutType) {
        const layout = MindmapLayoutType[key as keyof typeof MindmapLayoutType];
        const layoutDirections = LayoutDirectionsMap[layout];
        if (layoutDirections) {
            const hasSameDirection = layoutDirections.some(d => directions.includes(d));
            const hasReverseDirection = layoutDirections.some(r => reverseDirections.includes(r));
            if (hasSameDirection && !hasReverseDirection) {
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

export const getRootLayout = (root: MindmapElement) => {
    return root.layout || getDefaultMindmapLayout();
};
