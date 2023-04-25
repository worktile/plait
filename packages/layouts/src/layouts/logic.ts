import { LayoutNode, toHorizontal } from '../interfaces/layout-node';
import { LayoutTreeNode } from '../interfaces/layout-tree-node';
import { AbstractNode } from '../interfaces/mindmap';

export function setLayoutTreeResult(tree: LayoutTreeNode, root: LayoutNode, isHorizontal: Boolean) {
    if (isHorizontal) {
        root.y = tree.x;
    } else {
        root.x = tree.x;
    }
    tree.children.forEach((child, i) => {
        setLayoutTreeResult(child, root.children[i], isHorizontal);
    });
}

export function separateYAxle(node: LayoutNode, isHorizontal: boolean, d = 0) {
    if (isHorizontal) {
        if (AbstractNode.isAbstract(node.origin)) {
            for (let i = node.origin.start!; i <= node.origin.end!; i++) {
                const right = node.parent?.children[i].getBoundingBox().right;
                d = Math.max(right!, d);
            }
        }
        node.x = d;

        d += node.width;
    } else {
        if (AbstractNode.isAbstract(node.origin)) {
            for (let i = node.origin.start!; i <= node.origin.end!; i++) {
                const bottom = node.parent?.children[i].getBoundingBox().bottom;
                d = Math.max(bottom!, d);
            }
        }
        node.y = d;
        d += node.height;
    }
    node.children.forEach(child => {
        separateYAxle(child, isHorizontal, d);
    });
}

export const buildLayoutTree = (root: LayoutNode, isHorizontal: boolean) => {
    const children: LayoutTreeNode[] = [];
    root.children.forEach(child => {
        children.push(buildLayoutTree(child, isHorizontal));
    });
    if (isHorizontal) {
        if (root.blackNode) {
            root.blackNode = toHorizontal(root.blackNode);
        }
        return new LayoutTreeNode(root.height, root.width, root.x, children, root);
    }
    return new LayoutTreeNode(root.width, root.height, root.y, children, root);
};
