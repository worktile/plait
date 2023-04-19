import { LayoutTreeNode } from '../interfaces/layout-tree-node';

export const isAbstract = (origin: any) => {
    return typeof origin.start === 'number' && !isNaN(origin.start) && typeof origin.end === 'number' && !isNaN(origin.end);
};

export const getEndNodeSkipAbstract = (treeNode: LayoutTreeNode) => {
    let endNodeIndex = treeNode.childrenCount - 1;
    let endNode = treeNode.children[endNodeIndex];
    while (isAbstract(endNode.origin.origin)) {
        endNodeIndex--;
        endNode = treeNode.children[endNodeIndex];
    }
    return endNode;
};
