import { LayoutNode } from '../interfaces/layout-node';
import { AbstractNode, LayoutOptions } from '../interfaces/mind';
import { findAbstractByEndNode, getNonAbstractChildren } from '../utils/abstract';
import { isHorizontalLogicLayout } from '../utils/layout';

export function separateXAxle(node: LayoutNode, d = 0) {
    node.x = d;
    node.children.forEach(child => {
        if (AbstractNode.isAbstract(child.origin)) {
            let width = 0;
            for (let i = child.origin.start!; i <= child.origin.end!; i++) {
                const box = node.children[i].getBoundingBox();
                width = Math.max(box.width, width);
            }
            separateXAxle(child, node.x + node.width / 2 + width);
        } else {
            separateXAxle(child, node.x + node.width / 2);
        }
    });
}

export function separateYAxle(root: LayoutNode, options: LayoutOptions) {
    let previousBottom = root.y + root.height;
    let previousNode: null | LayoutNode = null;
    updateY(root);
    function updateY(node: LayoutNode) {
        node.children.forEach((child, index) => {
            const abstract = node.children.find(child => {
                return AbstractNode.isAbstract(child.origin) && child.origin.end === index - 1;
            });
            if (abstract) {
                const attach = previousNode?.origin.isCollapsed ? options.getExtendHeight(child.origin) : 0;
                previousBottom = abstractHandle(node, abstract) + attach;
            }

            if (AbstractNode.isAbstract(child.origin)) {
                return;
            }

            let y = previousBottom + child.vGap;
            if (previousNode && !isHorizontalLogicLayout(previousNode.layout) && previousNode.origin.children.length > 0) {
                if (previousNode.origin.isCollapsed) {
                    y = y + options.getExtendHeight(child.origin);
                } else {
                    y = y + options.getIndentedCrossLevelGap();
                }
            }
            child.y = y;
            previousNode = child;
            previousBottom = child.y + child.height;
            updateY(child);
        });
    }
}

function abstractHandle(node: LayoutNode, abstract: LayoutNode) {
    const abstractNode = abstract.origin as AbstractNode;
    const abstractIndex = node.children.indexOf(abstract);
    const startNode = node.children[abstractNode.start];
    const endNode = node.children[abstractNode.end];

    // abstract and start node alignment
    node.children[abstractIndex].y = startNode.y;

    const topContour = startNode.y;
    let bottomContour = endNode.y + endNode.height;

    let bottomContourNode: LayoutNode | null = endNode;
    let bottomContourParenNode = node;

    while (bottomContourNode?.children.length) {
        bottomContourParenNode = bottomContourNode;
        const children = getNonAbstractChildren(bottomContourParenNode);
        bottomContourNode = children[children.length - 1];

        const abstract = findAbstractByEndNode(bottomContourParenNode, bottomContourNode);
        bottomContour = abstract
            ? Math.max(abstract.y + abstract.height, bottomContourNode.y + bottomContourNode.height)
            : bottomContourNode.y + bottomContourNode.height;
    }

    const abstractIncludedHeight = bottomContour - topContour;
    const abstractHeight = abstract.blackNode ? abstract.blackNode.height : abstract.height;
    const abstractBranchHeight = abstract.blackNode ? abstract.blackNode.rootY * 2 + abstract.blackNode.rootHeight : abstract.height;
    if (abstractBranchHeight > abstractIncludedHeight) {
        const distance = (abstractBranchHeight - abstractIncludedHeight) / 2;
        for (let i = abstractNode.start; i <= abstractNode.end; i++) {
            node.children[i].eachNode(child => {
                child.y += distance;
            });
        }
    } else {
        const distance = (abstractIncludedHeight - abstractBranchHeight) / 2;
        node.children[abstractIndex].y += distance;
    }
    return Math.max(abstract.y + abstractHeight, startNode.y + abstractIncludedHeight);
}
