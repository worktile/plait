import { LayoutNode } from '../interfaces/layout-node';
import { LayoutTreeNode } from '../interfaces/layout-tree-node';
import { AbstractNode } from '../interfaces/mindmap';

export const getNonAbstractChildren = <T extends { children: T[] } = LayoutNode | LayoutTreeNode>(parentNode: T) => {
    return parentNode.children.filter(child => {
        if (child instanceof LayoutNode) {
            return !AbstractNode.isAbstract(child.origin);
        }
        if (child instanceof LayoutTreeNode) {
            return !AbstractNode.isAbstract(child.origin.origin);
        }
        return !AbstractNode.isAbstract(child);
    });
};

export const findAbstractByEndNode = <T extends { children: T[] } = LayoutNode | LayoutTreeNode>(parentNode: T, endNode: T) => {
    const index = parentNode.children.indexOf(endNode);
    return parentNode.children.find(child => {
        if (child instanceof LayoutNode) {
            return AbstractNode.isAbstract(child.origin) && child.origin.end === index;
        }
        if (child instanceof LayoutTreeNode) {
            return AbstractNode.isAbstract(child.origin.origin) && child.origin.origin.end === index;
        }
        return AbstractNode.isAbstract(child) && child.end === index;
    });
};

export const findAbstractByStartNode = <T extends { children: T[] } = LayoutNode | LayoutTreeNode>(parentNode: T, startNode: T) => {
    const index = parentNode.children.indexOf(startNode);
    return parentNode.children.find(child => {
        if (child instanceof LayoutNode) {
            return AbstractNode.isAbstract(child.origin) && child.origin.start === index;
        }
        if (child instanceof LayoutTreeNode) {
            return AbstractNode.isAbstract(child.origin.origin) && child.origin.origin.start === index;
        }
        return AbstractNode.isAbstract(child) && child.start === index;
    });
};
