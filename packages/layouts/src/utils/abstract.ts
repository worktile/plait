import { LayoutNode } from '../interfaces/layout-node';
import { LayoutTreeNode } from '../interfaces/layout-tree-node';
import { AbstractNode } from '../interfaces/mindmap';

export const getChildrenSkipAbstract = (treeNode: LayoutTreeNode) => {
    return treeNode.children.filter(child => {
        return !AbstractNode.isAbstract(child.origin.origin);
    });
};

export const getAbstractNodeByEndNode = (nodeParent: LayoutTreeNode, endNode: LayoutTreeNode) => {
    const nodeIndex = nodeParent.children.indexOf(endNode);
    return nodeParent.children.find(child => {
        const abstractNode = child.origin.origin as AbstractNode;
        return abstractNode.end === nodeIndex;
    });
};

export const getAbstractNodeByStartNode = (nodeParent: LayoutTreeNode, startNode: LayoutTreeNode) => {
    const nodeIndex = nodeParent.children.indexOf(startNode);
    return nodeParent.children.find(child => {
        const abstractNode = child.origin.origin as AbstractNode;
        return abstractNode.start === nodeIndex;
    });
};

export const getAbstractNodeByEndNode2 = (nodeParent: LayoutNode, endNode: LayoutNode) => {
    const nodeIndex = nodeParent.children.indexOf(endNode);
    return nodeParent.children.find(child => {
        const abstractNode = child.origin as AbstractNode;
        return abstractNode.end === nodeIndex;
    });
};
