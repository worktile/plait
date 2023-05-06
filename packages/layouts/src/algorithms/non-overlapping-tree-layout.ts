import { LayoutTreeNode } from '../interfaces/layout-tree-node';
import { findAbstractByEndNode, findAbstractByStartNode, getNonAbstractChildren, getCorrectStartEnd } from '../utils/abstract';
import { AbstractNode } from '../interfaces/mindmap';

function moveSubtree(treeNode: LayoutTreeNode, i: number, distance: number) {
    // Move subtree by changing modifier.
    treeNode.children[i].modifier += distance;
}

function nextLeftContour(treeNode: LayoutTreeNode) {
    return treeNode.childrenCount === 0 ? null : treeNode.children[0];
}

function nextRightContour(treeNode: LayoutTreeNode) {
    let children = getNonAbstractChildren(treeNode);
    return treeNode.childrenCount === 0 ? null : children[children.length - 1];
}

// separate left siblings
function separate(treeNode: LayoutTreeNode, i: number) {
    if (AbstractNode.isAbstract(treeNode.children[i].origin.origin)) {
        return;
    }

    let leftNode: LayoutTreeNode | null = treeNode.children[i - 1];
    let rightNode: LayoutTreeNode | null = treeNode.children[i];

    let rightContourOfLeftNode = leftNode.modifier + leftNode.preliminary + leftNode.width;
    let leftContourOfRightNode = rightNode.modifier + rightNode.preliminary;
    let sumOfLeftModifier = 0;

    let leftNodeParent = treeNode;
    let rightNodeParent = treeNode;

    while (leftNode || rightNode) {
        if (leftNode) {
            let right = sumOfLeftModifier + leftNode.modifier + leftNode.preliminary + leftNode.width;

            if (right > rightContourOfLeftNode) {
                rightContourOfLeftNode = right;
            }
            rightContourOfLeftNode = compareAbstractRight(leftNodeParent, leftNode, rightContourOfLeftNode, sumOfLeftModifier);

            leftNodeParent = leftNode;
            sumOfLeftModifier = leftNode.modifier + sumOfLeftModifier;
            leftNode = nextRightContour(leftNode);
        }

        if (rightNode) {
            let left = rightNode.modifier + rightNode.preliminary;
            if (left < leftContourOfRightNode) {
                leftContourOfRightNode = left;
            }

            leftContourOfRightNode = compareAbstractLeft(rightNodeParent, rightNode, leftContourOfRightNode);

            rightNodeParent = rightNode;
            rightNode = nextLeftContour(rightNode);
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
    const children = getNonAbstractChildren(treeNode);
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
        const abstracts = treeNode.children.filter(abstract => {
            return AbstractNode.isAbstract(abstract.origin.origin);
        });

        const abstract = abstracts.find(abstract => {
            const { end } = getCorrectStartEnd(abstract.origin, treeNode.origin);
            return end === i - 1;
        });

        if (abstract) {
            abstractHandle(treeNode, abstract, i);
        }

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

function abstractHandle(treeNode: LayoutTreeNode, abstract: LayoutTreeNode, i: number) {
    const { start, end } = getCorrectStartEnd(abstract.origin, treeNode.origin);

    const abstractIndex = treeNode.children.indexOf(abstract);
    const startNode = treeNode.children[start];

    let endNode = treeNode.children[end];

    const includeElementStartX = startNode.modifier;
    let includeElementEndX = endNode.modifier + endNode.preliminary + endNode.width;

    let sumOfLeftModifier = endNode.modifier;
    let nodeParent = treeNode;
    //概要和起始节点对齐
    treeNode.children[abstractIndex].modifier = startNode.modifier;

    while (endNode.childrenCount) {
        nodeParent = endNode;
        const nexRightNode = nextRightContour(endNode);
        endNode = nexRightNode ? nexRightNode : endNode;
        let right = sumOfLeftModifier + endNode.modifier + endNode.preliminary + endNode.width;

        includeElementEndX = compareAbstractRight(nodeParent, endNode, includeElementEndX, sumOfLeftModifier);
        sumOfLeftModifier += endNode.modifier;

        if (right > includeElementEndX) {
            includeElementEndX = right;
        }
    }

    const abstractBranchWidth = abstract.origin.blackNode
        ? abstract.origin.blackNode.rootX * 2 + abstract.origin.blackNode.rootWidth
        : abstract.width;
    const abstractIncludeElementWidth = includeElementEndX - includeElementStartX;

    //「判断概要」和「概括的内容宽度」
    if (abstractIncludeElementWidth > abstractBranchWidth) {
        const distance = (abstractIncludeElementWidth - abstractBranchWidth) / 2;
        moveSubtree(treeNode, abstractIndex, distance);
    } else {
        const distance = (abstractBranchWidth - abstractIncludeElementWidth) / 2;
        for (let i = start; i < end + 1; i++) {
            moveSubtree(treeNode, i, distance);
        }
    }
}

function compareAbstractRight(nodeParent: LayoutTreeNode, node: LayoutTreeNode, compareTarget: number, sumOfAbstractModifier: number) {
    const abstract = findAbstractByEndNode(nodeParent, node);
    if (abstract) {
        return Math.max(abstract.modifier + abstract.width + sumOfAbstractModifier, compareTarget);
    }
    return compareTarget;
}

function compareAbstractLeft(nodeParent: LayoutTreeNode, node: LayoutTreeNode, compareTarget: number) {
    const abstract = findAbstractByStartNode(nodeParent, node);

    if (abstract) {
        return Math.min(abstract.modifier + abstract.preliminary, compareTarget);
    }
    return compareTarget;
}

function layout(treeNode: LayoutTreeNode) {
    firstWalk(treeNode);
    secondWalk(treeNode, 0);
}

export { layout };
