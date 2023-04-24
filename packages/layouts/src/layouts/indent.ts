import { LayoutNode } from '../interfaces/layout-node';
import { AbstractNode, LayoutOptions } from '../interfaces/mindmap';
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

    let endNode = node.children[abstractNode.end];

    const elementTop = startNode.y;
    let elementBottom = endNode.y + endNode.height;
    let parentNode = node;

    //概要和起始节点对齐
    node.children[abstractIndex].y = startNode.y;

    while (endNode?.children.length) {
        parentNode = endNode;
        const children = parentNode.children.filter(child => {
            return !AbstractNode.isAbstract(child.origin);
        });
        endNode = children[children.length - 1];

        const endNodeIndex = endNode.parent!.children.indexOf(endNode);
        const abstract = parentNode.children.find(child => {
            return AbstractNode.isAbstract(child.origin) && child.origin.end === endNodeIndex;
        });
        elementBottom = abstract ? Math.max(abstract.y + abstract.height, endNode.y + endNode.height) : endNode.y + endNode.height;
    }

    const elementsHeight = elementBottom - elementTop;
    const abstractHeight = abstract.blackNode ? abstract.blackNode.height : abstract.height;

    const abstractRootCenter = abstract.blackNode ? abstract.blackNode.rootY + abstract.blackNode.rootHeight / 2 : abstract.height / 2;
    const elementCenter = elementsHeight / 2;
    let distance = 0;
    //比较两者高度
    if (abstractRootCenter > elementCenter) {
        distance = abstractRootCenter - elementCenter;
        for (let i = abstractNode.start; i <= abstractNode.end; i++) {
            node.children[i].eachNode(child => {
                child.y += distance;
            });
        }
    } else {
        distance = elementCenter - abstractRootCenter;
        node.children[abstractIndex].y += distance;
    }
    return Math.max(abstract.y + abstractHeight, endNode.y + endNode.height);
}
