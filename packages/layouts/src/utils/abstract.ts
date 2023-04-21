import { LayoutTreeNode } from '../interfaces/layout-tree-node';
import { AbstractNode } from '../interfaces/mindmap';

export const getChildrenSkipAbstract = (treeNode: LayoutTreeNode) => {
    return treeNode.children.filter(child => {
        return !AbstractNode.isAbstract(child.origin.origin);
    });
};
