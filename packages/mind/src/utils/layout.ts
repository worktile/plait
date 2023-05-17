import { LayoutDirection, LayoutDirectionsMap, MindElement, PlaitMind } from '../interfaces';
import { isIndentedLayout, MindLayoutType } from '@plait/layouts';

export const getBranchDirectionsByLayouts = (branchLayouts: MindLayoutType[]) => {
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

export const isCorrectLayout = (root: MindElement, layout: MindLayoutType) => {
    const rootLayout = root.layout || getDefaultLayout();
    return !getInCorrectLayoutDirection(rootLayout, layout);
};

export const isMixedLayout = (parentLayout: MindLayoutType, layout: MindLayoutType) => {
    return (!isIndentedLayout(parentLayout) && isIndentedLayout(layout)) || (isIndentedLayout(parentLayout) && !isIndentedLayout(layout));
};

export const getInCorrectLayoutDirection = (rootLayout: MindLayoutType, layout: MindLayoutType) => {
    const directions = LayoutDirectionsMap[rootLayout];
    const subLayoutDirections = LayoutDirectionsMap[layout];
    if (!subLayoutDirections) {
        throw new Error(`unexpected layout: ${layout} on correct layout`);
    }
    return subLayoutDirections.find(d => directions.includes(getLayoutReverseDirection(d)));
};

export const correctLayoutByDirection = (layout: MindLayoutType, direction: LayoutDirection) => {
    const isHorizontal = direction === LayoutDirection.left || direction === LayoutDirection.right ? true : false;
    let inverseDirectionLayout = MindLayoutType.standard;
    switch (layout) {
        case MindLayoutType.left:
            inverseDirectionLayout = MindLayoutType.right;
            break;
        case MindLayoutType.right:
            inverseDirectionLayout = MindLayoutType.left;
            break;
        case MindLayoutType.downward:
            inverseDirectionLayout = MindLayoutType.upward;
            break;
        case MindLayoutType.upward:
            inverseDirectionLayout = MindLayoutType.downward;
            break;
        case MindLayoutType.rightBottomIndented:
            inverseDirectionLayout = isHorizontal ? MindLayoutType.leftBottomIndented : MindLayoutType.rightTopIndented;
            break;
        case MindLayoutType.leftBottomIndented:
            inverseDirectionLayout = isHorizontal ? MindLayoutType.rightBottomIndented : MindLayoutType.leftTopIndented;
            break;
        case MindLayoutType.rightTopIndented:
            inverseDirectionLayout = isHorizontal ? MindLayoutType.leftTopIndented : MindLayoutType.rightBottomIndented;
            break;
        case MindLayoutType.leftTopIndented:
            inverseDirectionLayout = isHorizontal ? MindLayoutType.rightTopIndented : MindLayoutType.leftBottomIndented;
            break;
    }
    return inverseDirectionLayout;
};

export const getLayoutDirection = (root: MindElement) => {
    const layout = root.layout || getDefaultLayout();
    return LayoutDirectionsMap[layout];
};

export const getDefaultLayout = () => {
    return MindLayoutType.standard;
};

export const getAvailableSubLayoutsByLayoutDirections = (directions: LayoutDirection[]): MindLayoutType[] => {
    const result: MindLayoutType[] = [];
    const reverseDirections = directions.map(getLayoutReverseDirection);
    for (const key in MindLayoutType) {
        const layout = MindLayoutType[key as keyof typeof MindLayoutType];
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

export const getRootLayout = (root: MindElement) => {
    return root.layout || getDefaultLayout();
};
