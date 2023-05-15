import { LayoutNode } from '../interfaces/layout-node';
import { LayoutType, MindLayoutType } from '../interfaces/mind';

export function findLayoutType(node: LayoutNode): MindLayoutType | null {
    if (node.origin.layout) {
        return node.origin.layout as MindLayoutType;
    }

    if (node.parent) {
        return findLayoutType(node.parent);
    }

    return null;
}

export const isIndentedLayout = (layout: MindLayoutType) => {
    return (
        layout === MindLayoutType.rightBottomIndented ||
        layout === MindLayoutType.rightTopIndented ||
        layout === MindLayoutType.leftBottomIndented ||
        layout === MindLayoutType.leftTopIndented
    );
};

export const isLogicLayout = (layout: MindLayoutType) => {
    return (
        layout === MindLayoutType.right ||
        layout === MindLayoutType.left ||
        layout === MindLayoutType.downward ||
        layout === MindLayoutType.upward
    );
};

export const isStandardLayout = (layout: MindLayoutType) => {
    return layout === MindLayoutType.standard;
};

export const isHorizontalLayout = (layout: MindLayoutType) => {
    return (
        layout === MindLayoutType.right ||
        layout === MindLayoutType.left ||
        layout === MindLayoutType.standard ||
        isIndentedLayout(layout)
    );
};

export const isHorizontalLogicLayout = (layout: MindLayoutType) => {
    return layout === MindLayoutType.right || layout === MindLayoutType.left || layout === MindLayoutType.standard;
};

export const isVerticalLogicLayout = (layout: MindLayoutType) => {
    return layout === MindLayoutType.upward || layout === MindLayoutType.downward;
};

export const isTopLayout = (layout: MindLayoutType) => {
    return (
        layout === MindLayoutType.leftTopIndented || layout === MindLayoutType.rightTopIndented || layout === MindLayoutType.upward
    );
};

export const isBottomLayout = (layout: MindLayoutType) => {
    return (
        layout === MindLayoutType.leftBottomIndented ||
        layout === MindLayoutType.rightBottomIndented ||
        layout === MindLayoutType.downward
    );
};

export const isLeftLayout = (layout: MindLayoutType) => {
    return (
        layout === MindLayoutType.left || layout === MindLayoutType.leftTopIndented || layout === MindLayoutType.leftBottomIndented
    );
};

export const isRightLayout = (layout: MindLayoutType) => {
    return (
        layout === MindLayoutType.right ||
        layout === MindLayoutType.rightTopIndented ||
        layout === MindLayoutType.rightBottomIndented
    );
};

export const extractLayoutType = (mindLayoutType: MindLayoutType): LayoutType => {
    if (isIndentedLayout(mindLayoutType)) {
        return LayoutType.indented;
    }
    if (isStandardLayout(mindLayoutType)) {
        return LayoutType.logic;
    }
    if (isLogicLayout(mindLayoutType)) {
        return LayoutType.logic;
    }
    return LayoutType.logic;
};

export const getAbstractLayout = (mindLayoutType: MindLayoutType) => {
    if (isIndentedLayout(mindLayoutType)) {
        if (isRightLayout(mindLayoutType)) {
            return MindLayoutType.right;
        } else {
            return MindLayoutType.left;
        }
    }
    return mindLayoutType;
};
