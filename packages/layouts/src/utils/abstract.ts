import { LayoutNode } from '../interfaces/layout-node';
import { LayoutTreeNode } from '../interfaces/layout-tree-node';
import { AbstractNode } from '../interfaces/mind';
import { isStandardLayout } from './layout';

export const getNonAbstractChildren = <T extends { children?: T[] } = LayoutNode | LayoutTreeNode>(parentNode: T) => {
    if (parentNode.children) {
        return parentNode.children?.filter(child => {
            if (child instanceof LayoutNode) {
                return !AbstractNode.isAbstract(child.origin);
            }
            if (child instanceof LayoutTreeNode) {
                return !AbstractNode.isAbstract(child.origin.origin);
            }
            return !AbstractNode.isAbstract(child);
        });
    } else {
        return [];
    }
};

export const findAbstractByEndNode = <T extends { children: T[] } = LayoutNode | LayoutTreeNode>(parentNode: T, endNode: T) => {
    const index = parentNode.children.indexOf(endNode);
    return parentNode.children.find(child => {
        if (child instanceof LayoutNode) {
            return AbstractNode.isAbstract(child.origin) && child.origin.end === index;
        }
        if (child instanceof LayoutTreeNode && parentNode instanceof LayoutTreeNode) {
            if (AbstractNode.isAbstract(child.origin.origin)) {
                const { end } = getCorrectStartEnd(child.origin.origin, parentNode.origin);
                return end === index;
            }
            return false;
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
        if (child instanceof LayoutTreeNode && parentNode instanceof LayoutTreeNode) {
            if (AbstractNode.isAbstract(child.origin.origin)) {
                const { start } = getCorrectStartEnd(child.origin.origin, parentNode.origin);
                return start === index;
            }
            return false;
        }
        return AbstractNode.isAbstract(child) && child.start === index;
    });
};

export const isChildOfAbstract = (node: LayoutNode) => {
    let parent: LayoutNode | undefined = node.parent;
    while (parent) {
        if (AbstractNode.isAbstract(parent.origin)) {
            return true;
        }
        parent = parent?.parent;
    }
    return false;
};

/**
 * handle standard layout effect
 * the abstract correct start and end should sub rightNodeCount when it is set on left area
 */
export const getCorrectStartEnd = (abstract: AbstractNode, parent: LayoutNode) => {
    let start = abstract.start;
    let end = abstract.end;
    if (isStandardLayout(parent.layout)) {
        const rightNodeCount = parent.origin.rightNodeCount;
        if (start >= rightNodeCount) {
            end -= rightNodeCount;
            start -= rightNodeCount;
        }
    }
    return { start, end };
};
