import { LayoutTreeNode } from '../interfaces/layout-tree-node';

export const isAbstract = (origin: any) => {
    return typeof origin.start === 'number' && !isNaN(origin.start) && typeof origin.end === 'number' && !isNaN(origin.end);
};

export const getChildrenSkipAbstract = (treeNode: LayoutTreeNode) => {
    return treeNode.children.filter(child => {
        return isAbstract(child.origin.origin);
    });
};
