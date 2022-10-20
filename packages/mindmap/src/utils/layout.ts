import { LayoutDirection, LayoutDirectionsMap, MindmapElement } from '../interfaces';
import { isIndentedLayout, MindmapLayoutType } from '@plait/layouts';

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

export const isMixedLayout = (parentLayout: MindmapLayoutType, layout: MindmapLayoutType) => {
    return (!isIndentedLayout(parentLayout) && isIndentedLayout(layout)) || (isIndentedLayout(parentLayout) && !isIndentedLayout(layout));
};

export const getInCorrectLayoutDirection = (rootLayout: MindmapLayoutType, layout: MindmapLayoutType) => {
    const mindmapDirections = LayoutDirectionsMap[rootLayout];
    const subLayoutDirections = LayoutDirectionsMap[layout];
    if (!subLayoutDirections) {
        throw new Error(`unexpection layout: ${layout} on correct layout`);
    }
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
        case MindmapLayoutType.upward:
            inverseDirectionLayout = MindmapLayoutType.downward;
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
