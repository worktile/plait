import { LayoutTree } from '../interfaces/tree';

function moveSubtree(tree: LayoutTree, i: number, distance: number) {
    // Move subtree by changing modifier.
    tree.children[i].modifier += distance;
}

function nextLeftContour(tree: LayoutTree) {
    return tree.childrenCount === 0 ? tree : tree.children[0];
}

function nextRightContour(tree: LayoutTree) {
    return tree.childrenCount === 0 ? tree : tree.children[tree.childrenCount - 1];
}

// seperate left siblings
function seperate(tree: LayoutTree, i: number) {
    let leftNode = tree.children[i - 1];
    let rightNode = tree.children[i];

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
        moveSubtree(tree, i, distance);
    }
}

function positionRootCenter(tree: LayoutTree) {
    // Position root between children, taking into account their mod.
    const startNode = tree.children[0];
    let startX = startNode.preliminary + startNode.modifier;
    /**
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
    const endNode = tree.children[tree.childrenCount - 1];
    let endX = endNode.modifier + endNode.preliminary + endNode.width;
    if (endNode.origin.blackNode && (endNode.origin.blackNode.rootX + endNode.origin.blackNode.rootWidth) < endNode.origin.blackNode.right) {
        endX = endX - (endNode.origin.blackNode.right - (endNode.origin.blackNode.rootX + endNode.origin.blackNode.rootWidth));
    }
    const preliminary = (startX + endX) / 2 - tree.width / 2;
    // move sub tree when preliminary to avoid root shifting to left
    if (preliminary > 0) {
        tree.preliminary = preliminary;
    } else {
        tree.children.forEach((c, index) => {
            moveSubtree(tree, index, Math.abs(preliminary));
        });
    }
}

// update node's modifier and root node preliminary
function firstWalk(tree: LayoutTree) {
    if (tree.childrenCount === 0) {
        return;
    }
    firstWalk(tree.children[0]);
    for (let i = 1; i < tree.childrenCount; i++) {
        firstWalk(tree.children[i]);
        seperate(tree, i);
    }
    positionRootCenter(tree);
}

function secondWalk(tree: LayoutTree, sumOfModifier: number) {
    sumOfModifier += tree.modifier;
    // Set absolute (no-relative) horizontal coordinates.
    tree.x = tree.preliminary + sumOfModifier;
    for (let i = 0; i < tree.childrenCount; i++) {
        secondWalk(tree.children[i], sumOfModifier);
    }
}

function layout(tree: LayoutTree) {
    firstWalk(tree);
    secondWalk(tree, 0);
}

export { layout };
