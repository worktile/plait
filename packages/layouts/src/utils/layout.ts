import { LayoutNode } from '../interfaces/layout-node';
import { LayoutType, MindmapLayoutType } from '../interfaces/mindmap';

export function findLayoutType(node: LayoutNode): MindmapLayoutType | null {
    if (node.origin.layout) {
        return node.origin.layout as MindmapLayoutType;
    }

    if (node.parent) {
        return findLayoutType(node.parent);
    }

    return null;
}

export const isIndentedLayout = (layout: MindmapLayoutType) => {
    return (
        layout === MindmapLayoutType.rightBottomIndented ||
        layout === MindmapLayoutType.rightTopIndented ||
        layout === MindmapLayoutType.leftBottomIndented ||
        layout === MindmapLayoutType.leftTopIndented
    );
};

export const isLogicLayout = (layout: MindmapLayoutType) => {
    return (
        layout === MindmapLayoutType.right ||
        layout === MindmapLayoutType.left ||
        layout === MindmapLayoutType.downward ||
        layout === MindmapLayoutType.upward
    );
};

export const isStandardLayout = (layout: MindmapLayoutType | undefined) => {
    return layout === MindmapLayoutType.standard;
};

export const isHorizontalLayout = (layout: MindmapLayoutType) => {
    return (
        layout === MindmapLayoutType.right ||
        layout === MindmapLayoutType.left ||
        layout === MindmapLayoutType.standard ||
        isIndentedLayout(layout)
    );
};

export const isHorizontalLogicLayout = (layout: MindmapLayoutType) => {
    return layout === MindmapLayoutType.right || layout === MindmapLayoutType.left || layout === MindmapLayoutType.standard;
};

export const isVerticalLogicLayout = (layout: MindmapLayoutType) => {
    return layout === MindmapLayoutType.upward || layout === MindmapLayoutType.downward;
};

export const isTopLayout = (layout: MindmapLayoutType) => {
    return (
        layout === MindmapLayoutType.leftTopIndented || layout === MindmapLayoutType.rightTopIndented || layout === MindmapLayoutType.upward
    );
};

export const isBottomLayout = (layout: MindmapLayoutType) => {
    return (
        layout === MindmapLayoutType.leftBottomIndented ||
        layout === MindmapLayoutType.rightBottomIndented ||
        layout === MindmapLayoutType.downward
    );
};

export const isLeftLayout = (layout: MindmapLayoutType) => {
    return (
        layout === MindmapLayoutType.left || layout === MindmapLayoutType.leftTopIndented || layout === MindmapLayoutType.leftBottomIndented
    );
};

export const isRightLayout = (layout: MindmapLayoutType) => {
    return (
        layout === MindmapLayoutType.right ||
        layout === MindmapLayoutType.rightTopIndented ||
        layout === MindmapLayoutType.rightBottomIndented
    );
};

export const extractLayoutType = (mindmapLayoutType: MindmapLayoutType): LayoutType => {
    if (isIndentedLayout(mindmapLayoutType)) {
        return LayoutType.indented;
    }
    if (isStandardLayout(mindmapLayoutType)) {
        return LayoutType.logic;
    }
    if (isLogicLayout(mindmapLayoutType)) {
        return LayoutType.logic;
    }
    return LayoutType.logic;
};

export const getAbstractLayout = (mindmapLayoutType: MindmapLayoutType) => {
    if (isRightLayout(mindmapLayoutType)) {
        return MindmapLayoutType.right;
    } else {
        return MindmapLayoutType.left;
    }
};
