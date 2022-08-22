import { Tree } from './tree';

function moveSubtree(tree: Tree, i: number, distance: number) {
    // Move subtree by changing modifier.
    tree.children[i].modifier += distance;
}

function nextLeftContour(tree: Tree) {
    return tree.childrenCount === 0 ? tree : tree.children[0];
}

function nextRightContour(tree: Tree) {
    return tree.childrenCount === 0 ? tree : tree.children[tree.childrenCount - 1];
}

// seperate left siblings
function seperate(tree: Tree, i: number) {
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

function positionRoot(tree: Tree) {
    // Position root between children, taking into account their mod.
    tree.preliminary =
        (tree.children[0].preliminary +
            tree.children[0].modifier +
            tree.children[tree.childrenCount - 1].modifier +
            tree.children[tree.childrenCount - 1].preliminary +
            tree.children[tree.childrenCount - 1].width) /
            2 -
        tree.width / 2;
}

// update node's modifier and root node preliminary
function firstWalk(tree: Tree) {
    if (tree.childrenCount === 0) {
        return;
    }
    firstWalk(tree.children[0]);
    for (let i = 1; i < tree.childrenCount; i++) {
        firstWalk(tree.children[i]);
        seperate(tree, i);
    }
    positionRoot(tree);
}

function secondWalk(tree: Tree, sumOfModifier: number) {
    sumOfModifier += tree.modifier;
    // Set absolute (no-relative) horizontal coordinates.
    tree.x = tree.preliminary + sumOfModifier;
    for (let i = 0; i < tree.childrenCount; i++) {
        secondWalk(tree.children[i], sumOfModifier);
    }
}

function layout(tree: Tree) {
    firstWalk(tree);
    secondWalk(tree, 0);
}

export { layout };
