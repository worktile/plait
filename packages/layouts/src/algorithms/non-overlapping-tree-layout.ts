import { LayoutTreeNode } from '../interfaces/layout-tree-node';
import { getChildrenSkipAbstract } from '../utils/abstract';
import { AbstractNode } from '../interfaces/mindmap';

function moveSubtree(treeNode: LayoutTreeNode, i: number, distance: number) {
    // Move subtree by changing modifier.
    treeNode.children[i].modifier += distance;
}

function nextLeftContour(treeNode: LayoutTreeNode) {
    return treeNode.childrenCount === 0 ? treeNode : treeNode.children[0];
}

function nextRightContour(treeNode: LayoutTreeNode) {
    let children = getChildrenSkipAbstract(treeNode);
    return treeNode.childrenCount === 0 ? treeNode : children[children.length - 1];
}

// separate left siblings
function separate(treeNode: LayoutTreeNode, i: number) {
    if (AbstractNode.isAbstract(treeNode.children[i].origin.origin)) {
        return;
    }

    let leftNode = treeNode.children[i - 1];
    let rightNode = treeNode.children[i];

    let rightContourOfLeftNode = leftNode.modifier + leftNode.preliminary + leftNode.width;
    let leftContourOfRightNode = rightNode.modifier + rightNode.preliminary;
    let sumOfLeftModifier = leftNode.modifier;

    let leftNodeParent = treeNode;
    let rightNodeParent = treeNode;
    let sumOfAbstractModifier = 0;

    rightContourOfLeftNode = compareAbstractRight(leftNodeParent, leftNode, sumOfAbstractModifier, rightContourOfLeftNode);
    leftContourOfRightNode = compareAbstractLeft(rightNodeParent, rightNode, leftContourOfRightNode);

    while (true) {
        if (leftNode.childrenCount > 0) {
            leftNodeParent = leftNode;
            leftNode = nextRightContour(leftNode);
            let right = sumOfLeftModifier + leftNode.modifier + leftNode.preliminary + leftNode.width;
            sumOfLeftModifier += leftNode.modifier;
            sumOfAbstractModifier += leftNodeParent.modifier;
            if (right > rightContourOfLeftNode) {
                rightContourOfLeftNode = right;
            }
        }

        rightContourOfLeftNode = compareAbstractRight(leftNodeParent, leftNode, sumOfAbstractModifier, rightContourOfLeftNode);

        if (rightNode.childrenCount > 0) {
            rightNodeParent = rightNode;
            rightNode = nextLeftContour(rightNode);
            let left = rightNode.modifier + rightNode.preliminary;
            if (left < leftContourOfRightNode) {
                leftContourOfRightNode = left;
            }
        }

        leftContourOfRightNode = compareAbstractLeft(rightNodeParent, rightNode, leftContourOfRightNode);

        if (leftNode.childrenCount === 0 && rightNode.childrenCount === 0) {
            break;
        }
    }

    const distance = rightContourOfLeftNode - leftContourOfRightNode;
    if (distance > 0) {
        moveSubtree(treeNode, i, distance);
    }
}

function positionRootCenter(treeNode: LayoutTreeNode) {
    // Position root between children, taking into account their mod.
    const startNode = treeNode.children[0];
    let startX = startNode.preliminary + startNode.modifier;
    const children = getChildrenSkipAbstract(treeNode);
    const endNode = children[children.length - 1];
    let endX = endNode.modifier + endNode.preliminary + endNode.width;

    /**
     * nested layout: handle black node
     *                ---------
     *              |   parent  |
     *                ---------
     *  -------------
     * |     | ------ |        | ------ |
     * |     | child1 |        | child2 |
     * |     | ------ |        | ------ |
     * |    black     |
     * |              |
     *  -------------
     * The parent is in the center of child 1 and child 2, not black and child2
     */
    if (startNode.origin.blackNode && startNode.origin.blackNode.rootX > startNode.origin.blackNode.left) {
        startX = startX + (startNode.origin.blackNode.rootX - startNode.origin.blackNode.left);
    }
    if (endNode.origin.blackNode && endNode.origin.blackNode.rootX + endNode.origin.blackNode.rootWidth < endNode.origin.blackNode.right) {
        endX = endX - (endNode.origin.blackNode.right - (endNode.origin.blackNode.rootX + endNode.origin.blackNode.rootWidth));
    }

    /**
     * has underline shape: handle connecting position
     */
    if (startNode.origin.verticalConnectingPosition && endNode.origin.verticalConnectingPosition) {
        startX = startX + startNode.width - startNode.origin.vGap;
        endX = endX - endNode.origin.vGap;
    }
    let treeNodeOffset = treeNode.width / 2;
    if (treeNode.origin.verticalConnectingPosition) {
        treeNodeOffset = treeNode.width - treeNode.origin.vGap;
    }

    const preliminary = (startX + endX) / 2 - treeNodeOffset;
    // move sub tree when preliminary to avoid root shifting to left
    if (preliminary > 0) {
        treeNode.preliminary = preliminary;
    } else {
        treeNode.children.forEach((c, index) => {
            moveSubtree(treeNode, index, Math.abs(preliminary));
        });
    }
}

// update node's modifier and root node preliminary
function firstWalk(treeNode: LayoutTreeNode) {
    if (treeNode.childrenCount === 0) {
        return;
    }
    firstWalk(treeNode.children[0]);
    for (let i = 1; i < treeNode.childrenCount; i++) {
        abstractHandle(treeNode, i);
        firstWalk(treeNode.children[i]);
        separate(treeNode, i);
    }
    positionRootCenter(treeNode);
}

function secondWalk(treeNode: LayoutTreeNode, sumOfModifier: number) {
    sumOfModifier += treeNode.modifier;
    // Set absolute (no-relative) horizontal coordinates.
    treeNode.x = treeNode.preliminary + sumOfModifier;
    for (let i = 0; i < treeNode.childrenCount; i++) {
        secondWalk(treeNode.children[i], sumOfModifier);
    }
}

function abstractHandle(treeNode: LayoutTreeNode, i: number) {
    const abstract = treeNode.children.find(abstract => {
        return AbstractNode.isAbstract(abstract.origin.origin) && abstract.origin.origin.end === i - 1;
    });
    if (!abstract) {
        return;
    }
    const abstractNode = abstract.origin.origin as AbstractNode;
    const abstractStartNode = treeNode.children[abstractNode.start];
    const includeElementStartX = abstractStartNode.modifier;

    let abstractEndNode = treeNode.children[abstractNode.end];
    let includeElementEndX = abstractEndNode.modifier + abstractEndNode.preliminary + abstractEndNode.width;

    let abstractWidth = abstract.origin.blackNode
        ? abstract.origin.blackNode.rootX * 2 + abstract.origin.blackNode.rootWidth
        : abstract.width;
    let sumOfLeftModifier = abstractEndNode.modifier;

    let nodeParent = treeNode;

    while (true) {
        if (abstractEndNode.childrenCount > 0) {
            nodeParent = abstractEndNode;
            abstractEndNode = nextRightContour(abstractEndNode);
            let right = sumOfLeftModifier + abstractEndNode.modifier + abstractEndNode.preliminary + abstractEndNode.width;

            includeElementEndX = compareAbstractRight(nodeParent, abstractEndNode, sumOfLeftModifier, includeElementEndX);

            sumOfLeftModifier += abstractEndNode.modifier;

            if (right > includeElementEndX) {
                includeElementEndX = right;
            }
        }
        if (abstractEndNode.childrenCount === 0 && abstractEndNode.childrenCount === 0) {
            break;
        }
    }
    const abstractIncludeElementWidth = includeElementEndX - includeElementStartX;
    //概要，和起始节点对齐
    const abstractIndex = treeNode.children.indexOf(abstract);
    treeNode.children[abstractIndex].modifier = abstractStartNode.modifier;
    //「判断概要」和「概括的内容宽度」
    if (abstractIncludeElementWidth > abstractWidth) {
        const distance = (abstractIncludeElementWidth - abstractWidth) / 2;
        moveSubtree(treeNode, abstractIndex, distance);
    } else {
        const distance = (abstractWidth - abstractIncludeElementWidth) / 2;
        for (let i = abstractNode.start; i < abstractNode.end + 1; i++) {
            moveSubtree(treeNode, i, distance);
        }
    }
}

function compareAbstractRight(
    nodeParent: LayoutTreeNode,
    leftNode: LayoutTreeNode,
    sumOfAbstractModifier: number,
    rightContourOfLeftNode: number
) {
    let result = 0;
    const leftNodeIndex = nodeParent.children.indexOf(leftNode);
    const abstract = nodeParent.children.find(child => {
        return  AbstractNode.isAbstract(child.origin.origin) && child.origin.origin.end === leftNodeIndex;
    });

    if (abstract) {
        result = abstract.modifier + abstract.width + sumOfAbstractModifier;
    }
    if (rightContourOfLeftNode > result) {
        result = rightContourOfLeftNode;
    }

    return result;
}

function compareAbstractLeft(nodeParent: LayoutTreeNode, rightNode: LayoutTreeNode, rightContourOfLeftNode: number) {
    let result = 0;
    const nodeIndex = nodeParent.children.findIndex(child => {
        return child.origin.origin === rightNode.origin.origin;
    });

    const abstract = nodeParent.children.find(child => {
        return AbstractNode.isAbstract(child.origin.origin) && child.origin.origin.start === nodeIndex;
    });

    if (abstract) {
        result = abstract.modifier + abstract.preliminary;
    }
    if (rightContourOfLeftNode < result) {
        result = rightContourOfLeftNode;
    }

    return result;
}

function layout(treeNode: LayoutTreeNode) {
    firstWalk(treeNode);
    secondWalk(treeNode, 0);
}

export { layout };
