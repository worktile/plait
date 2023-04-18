import { LayoutTreeNode } from '../interfaces/layout-tree-node';

function moveSubtree(treeNode: LayoutTreeNode, i: number, distance: number) {
    // Move subtree by changing modifier.
    treeNode.children[i].modifier += distance;
}

function nextLeftContour(treeNode: LayoutTreeNode) {
    return treeNode.childrenCount === 0 ? treeNode : treeNode.children[0];
}

function nextRightContour(treeNode: LayoutTreeNode) {
    let endNodeIndex = treeNode.childrenCount - 1;
    let endNode = treeNode.children[endNodeIndex];
    while (endNode.origin.origin.isAbstract) {
        endNodeIndex--;
        endNode = treeNode.children[endNodeIndex];
    }
    return treeNode.childrenCount === 0 ? treeNode : treeNode.children[endNodeIndex];
}

// separate left siblings
function separate(treeNode: LayoutTreeNode, i: number) {
    if (treeNode.children[i].origin.origin.isAbstract) {
        return;
    }

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
    let endNodeIndex = treeNode.childrenCount - 1;
    let endNode = treeNode.children[endNodeIndex];
    while (endNode.origin.origin.isAbstract) {
        endNodeIndex--;
        endNode = treeNode.children[endNodeIndex];
    }
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
        firstWalk(treeNode.children[i]);
        separate(treeNode, i);
        separateFromAbstract(treeNode, i);
    }
    positionRootCenter(treeNode);
    positionFromAbstract(treeNode);
}

function secondWalk(treeNode: LayoutTreeNode, sumOfModifier: number) {
    sumOfModifier += treeNode.modifier;
    // Set absolute (no-relative) horizontal coordinates.
    treeNode.x = treeNode.preliminary + sumOfModifier;
    for (let i = 0; i < treeNode.childrenCount; i++) {
        secondWalk(treeNode.children[i], sumOfModifier);
    }
}

function separateFromAbstract(treeNode: LayoutTreeNode, i: number) {
    // left 节点是 abstract 的 end 节点
    const abstracts = treeNode.children.filter(child => {
        return child.origin.origin.isAbstract;
    });
    let abstract = abstracts.find(abstract => {
        return abstract.origin.origin.end === i - 1;
    });

    const abstractIndex = treeNode.children.findIndex(child => {
        return child.origin.origin.id === abstract?.origin.origin.id;
    });

    if (abstract) {
        //让abstract与start节点左对齐
        treeNode.children[abstractIndex].modifier = treeNode.children[treeNode.children[abstractIndex].origin.origin.start!].modifier;
    }

    if (abstract) {
        let abstractStartNode = treeNode.children[abstract.origin.origin.start!];
        let abstractEndNode = treeNode.children[abstract.origin.origin.end!];
        let sumOfLeftModifier = abstractEndNode.modifier - abstractStartNode.modifier;
        while (true) {
            if (abstractStartNode.childrenCount > 0) {
                abstractStartNode = nextLeftContour(abstractStartNode);
            }
            if (abstractEndNode.childrenCount > 0) {
                abstractEndNode = nextRightContour(abstractEndNode);
                sumOfLeftModifier += abstractEndNode.modifier;
            }
            if (abstractEndNode.childrenCount === 0 && abstractEndNode.childrenCount === 0) {
                break;
            }
        }

        const contentStartX = abstractStartNode.preliminary + abstractStartNode.modifier;
        const contentEndX = abstractStartNode.modifier + abstractEndNode.width + sumOfLeftModifier;
        const abstractContentWidth = contentEndX - contentStartX;
        const abstractWidth = abstract.origin.blackNode?.width || abstract.origin.width;
        if (abstractWidth > abstractContentWidth) {
            const distance = abstractWidth - abstractContentWidth;
            moveSubtree(treeNode, i, distance);
        }
    }
}

function positionFromAbstract(treeNode: LayoutTreeNode) {
    const abstracts = treeNode.children.filter(child => {
        return child.origin.origin.isAbstract;
    });

    if (abstracts.length) {
        abstracts.forEach(abstract => {
            const abstractIndex = treeNode.children.findIndex(child => {
                return child.origin.origin.id === abstract?.origin.origin.id;
            });
            let abstractStartNode = treeNode.children[abstract.origin.origin.start!];
            let abstractEndNode = treeNode.children[abstract.origin.origin.end!];
            let contentStartX = abstractStartNode.modifier;
            let sumOfLeftModifier = abstractEndNode.modifier;
            let contentEndX = abstractEndNode.modifier + abstractEndNode.width;
            while (true) {
                if (abstractEndNode.childrenCount > 0) {
                    abstractEndNode = nextRightContour(abstractEndNode);
                    let right = sumOfLeftModifier + abstractEndNode.modifier + abstractEndNode.width;
                    sumOfLeftModifier += abstractEndNode.modifier;

                    if (right > contentEndX) {
                        contentEndX = right;
                    }
                }
                if (abstractEndNode.childrenCount === 0 && abstractEndNode.childrenCount === 0) {
                    break;
                }
            }
            const abstractContentWidth = contentEndX - contentStartX;
            let abstractWidth = abstract.origin.blackNode?.width || abstract.origin.width;
            if (abstractWidth > abstractContentWidth) {
                if (abstract.origin.blackNode) {
                    abstractWidth = abstract.origin.blackNode.rootX * 2 + abstract.origin.blackNode.rootWidth;
                }
                const distance = (abstractWidth - abstractContentWidth) / 2;
                for (let i = abstract.origin.origin.start!; i < abstract.origin.origin.end! + 1; i++) {
                    moveSubtree(treeNode, i, distance);
                }
            } else {
                const distance = (abstractContentWidth - abstractWidth) / 2;
                moveSubtree(treeNode, abstractIndex, distance);
            }
        });
    }
}

function layout(treeNode: LayoutTreeNode) {
    firstWalk(treeNode);
    secondWalk(treeNode, 0);
}

export { layout };
