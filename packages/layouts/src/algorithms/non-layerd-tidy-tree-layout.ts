import { LayoutTree } from '../interfaces/tree';

function setExtremes(tree: LayoutTree) {
    if (tree.childrenCount === 0) {
        tree.leftExtreme = tree;
        tree.rightExtreme = tree;
        tree.msel = tree.mser = 0;
    } else {
        tree.leftExtreme = tree.children[0].leftExtreme;
        tree.msel = tree.children[0].msel;
        tree.rightExtreme = tree.children[tree.childrenCount - 1].rightExtreme;
        tree.mser = tree.children[tree.childrenCount - 1].mser;
    }
}

function bottom(tree: LayoutTree) {
    return tree.y + tree.height;
}

/* A linked list of the indexes of left siblings and their lowest vertical coordinate.
 */
class IYL {
    lowY: number;
    index: number;
    next: IYL | null;
    constructor(lowY: number, index: number, next: IYL | null) {
        this.lowY = lowY;
        this.index = index;
        this.next = next;
    }
}

function updateIYL(minY: number, i: number, ih: IYL | null) {
    // Remove siblings that are hidden by the new subtree.
    while (ih !== null && minY >= ih.lowY) {
        // Prepend the new subtree
        ih = ih.next;
    }
    return new IYL(minY, i, ih);
}

function distributeExtra(tree: LayoutTree, i: number, si: number, distance: number) {
    // Are there intermediate children?
    if (si !== i - 1) {
        const nr = i - si;
        tree.children[si + 1].shift += distance / nr;
        tree.children[i].shift -= distance / nr;
        tree.children[i].change -= distance - distance / nr;
    }
}

function moveSubtree(tree: LayoutTree, i: number, si: number, distance: number) {
    // Move subtree by changing mod.
    tree.children[i].modifier += distance;
    tree.children[i].msel += distance;
    tree.children[i].mser += distance;
    distributeExtra(tree, i, si, distance);
}

function nextLeftContour(tree: LayoutTree) {
    return tree.childrenCount === 0 ? tree.leftThread : tree.children[0];
}

function nextRightContour(tree: LayoutTree) {
    return tree.childrenCount === 0 ? tree.rightThread : tree.children[tree.childrenCount - 1];
}

function setLeftThread(tree: LayoutTree, i: number, cl: LayoutTree, modsumcl: number) {
    const li = tree.children[0].leftExtreme as LayoutTree;
    li.leftThread = cl;
    // Change mod so that the sum of modifier after following thread is correct.
    const diff = modsumcl - cl.modifier - tree.children[0].msel;
    li.modifier += diff;
    // Change preliminary x coordinate so that the node does not move.
    li.preliminary -= diff;
    // Update extreme node and its sum of modifiers.
    tree.children[0].leftExtreme = tree.children[i].leftExtreme;
    tree.children[0].msel = tree.children[i].msel;
}

// Symmetrical to setLeftThread
function setRightThread(tree: LayoutTree, i: number, sr: any, modsumsr: number) {
    const ri = tree.children[i].rightExtreme as LayoutTree;
    ri.rightThread = sr;
    const diff = modsumsr - sr.modifier - tree.children[i].mser;
    ri.modifier += diff;
    ri.preliminary -= diff;
    tree.children[i].rightExtreme = tree.children[i - 1].rightExtreme;
    tree.children[i].mser = tree.children[i - 1].mser;
}

function seperate(tree: LayoutTree, i: number, ih: IYL) {
    // Right contour node of left siblings and its sum of modifiers.
    let sr = tree.children[i - 1];
    let mssr = sr.modifier;
    // Left contour node of right siblings and its sum of modifiers.
    let cl = tree.children[i];
    let mscl = cl.modifier;
    while (sr !== null && cl !== null) {
        if (bottom(sr) > ih.lowY) {
            ih = ih.next as IYL;
        }
        // How far to the left of the right side of sr is the left side of cl.
        const distance = mssr + sr.preliminary + sr.width - (mscl + cl.preliminary);
        if (distance > 0) {
            mscl += distance;
            moveSubtree(tree, i, ih.index, distance);
        }

        const sy = bottom(sr);
        const cy = bottom(cl);
        // Advance highest node(s) and sum(s) of modifiers
        if (sy <= cy) {
            sr = nextRightContour(sr);
            if (sr !== null) {
                mssr += sr.modifier;
            }
        }
        if (sy >= cy) {
            cl = nextLeftContour(cl);
            if (cl !== null) {
                mscl += cl.modifier;
            }
        }
    }

    // Set threads and update extreme nodes.
    // In the first case, the current subtree must be taller than the left siblings.
    if (sr === null && cl !== null) {
        setLeftThread(tree, i, cl, mscl);
    } else if (sr !== null && cl === null) {
        // In this case, the left siblings must be taller than the current subtree
        setRightThread(tree, i, sr, mssr);
    }
}

function positionRoot(tree: LayoutTree) {
    // Position root between children, taking into account their mod.
    tree.preliminary =
        (tree.children[0].preliminary + tree.children[0].modifier + tree.children[tree.childrenCount - 1].modifier + tree.children[tree.childrenCount - 1].preliminary + tree.children[tree.childrenCount - 1].width) / 2 - tree.width / 2;
}

function firstWalk(tree: LayoutTree) {
    if (tree.childrenCount === 0) {
        setExtremes(tree);
        return;
    }
    firstWalk(tree.children[0]);
    // Create siblings in contour minimal vertical coordinate and index list
    let ih = updateIYL(bottom(tree.children[0].leftExtreme as LayoutTree), 0, null);
    for (let i = 1; i < tree.childrenCount; i++) {
        firstWalk(tree.children[i]);
        // Store lowest vertical coordinate while extreme nodes still point in current subtree
        const minY = bottom(tree.children[i].rightExtreme as LayoutTree);
        seperate(tree, i, ih);
        ih = updateIYL(minY, i, ih);
    }
    positionRoot(tree);
    setExtremes(tree);
}

function addChildSpacing(tree: LayoutTree) {
    let d = 0;
    let modsumdelta = 0;
    for (let i = 0; i < tree.childrenCount; i++) {
        d += tree.children[i].shift;
        modsumdelta += d + tree.children[i].change;
        tree.children[i].modifier += modsumdelta;
    }
}

function secondWalk(tree: LayoutTree, modsum: number) {
    modsum += tree.modifier;
    // Set absolute (no-relative) horizontal coordinates.
    tree.x = tree.preliminary + modsum;
    addChildSpacing(tree);
    for (let i = 0; i < tree.childrenCount; i++) {
        secondWalk(tree.children[i], modsum);
    }
}

function layout(tree: LayoutTree) {
    firstWalk(tree);
    secondWalk(tree, 0);
}

export { layout };
