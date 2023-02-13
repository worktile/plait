import { LayoutTreeNode } from '../interfaces/layout-tree-node';

function moveSubtree(treeNode: LayoutTreeNode, i: number, distance: number) {
    // Move subtree by changing modifier.
    treeNode.children[i].modifier += distance;
}

function nextLeftContour(treeNode: LayoutTreeNode) {
    return treeNode.childrenCount === 0 ? treeNode : treeNode.children[0];
}

function nextRightContour(treeNode: LayoutTreeNode) {
    return treeNode.childrenCount === 0 ? treeNode : treeNode.children[treeNode.childrenCount - 1];
}

// seperate left siblings
function seperate(treeNode: LayoutTreeNode, i: number) {
    let leftNode = treeNode.children[i - 1];
    let rightNode = treeNode.children[i];

    let rightContourOfLeftNode = leftNode.modifier + leftNode.preliminary + leftNode.width;
    let leftContourOfRightNode = rightNode.modifier + rightNode.preliminary;
    let sumOfLeftModifier = leftNode.modifier;

    while (true) {
        if (leftNode.childrenCount > 0) {
            leftNode = nextRightContour(leftNode);
            let right = sumOfLeftModifier + leftNode.modifier + leftNode.preliminary + leftNode.width;
            sumOfLeftModifier += leftNode.modifier;
            if (right > rightContourOfLeftNode) {
                rightContourOfLeftNode = right;
            }
        }
        if (rightNode.childrenCount > 0) {
            rightNode = nextLeftContour(rightNode);
            let left = rightNode.modifier + rightNode.preliminary;
            if (left < leftContourOfRightNode) {
                leftContourOfRightNode = left;
            }
        }
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
    const endNode = treeNode.children[treeNode.childrenCount - 1] ;
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
    if (endNode.origin.blackNode && (endNode.origin.blackNode.rootX + endNode.origin.blackNode.rootWidth) < endNode.origin.blackNode.right) {
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
        firstWalk(treeNode.children[i]);
        seperate(treeNode, i);
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

function layout(treeNode: LayoutTreeNode) {
    firstWalk(treeNode);
    secondWalk(treeNode, 0);
}

export { layout };
