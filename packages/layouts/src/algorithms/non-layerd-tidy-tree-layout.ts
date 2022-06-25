import { Tree } from './tree';

function setExtremes(tree: Tree) {
    if (tree.cs === 0) {
        tree.el = tree;
        tree.er = tree;
        tree.msel = tree.mser = 0;
    } else {
        tree.el = tree.c[0].el;
        tree.msel = tree.c[0].msel;
        tree.er = tree.c[tree.cs - 1].er;
        tree.mser = tree.c[tree.cs - 1].mser;
    }
}

function bottom(tree: Tree) {
    return tree.y + tree.h;
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

function distributeExtra(tree: Tree, i: number, si: number, distance: number) {
    // Are there intermediate children?
    if (si !== i - 1) {
        const nr = i - si;
        tree.c[si + 1].shift += distance / nr;
        tree.c[i].shift -= distance / nr;
        tree.c[i].change -= distance - distance / nr;
    }
}

function moveSubtree(tree: Tree, i: number, si: number, distance: number) {
    // Move subtree by changing mod.
    tree.c[i].mod += distance;
    tree.c[i].msel += distance;
    tree.c[i].mser += distance;
    distributeExtra(tree, i, si, distance);
}

function nextLeftContour(tree: Tree) {
    return tree.cs === 0 ? tree.tl : tree.c[0];
}

function nextRightContour(tree: Tree) {
    return tree.cs === 0 ? tree.tr : tree.c[tree.cs - 1];
}

function setLeftThread(tree: Tree, i: number, cl: Tree, modsumcl: number) {
    const li = tree.c[0].el as Tree;
    li.tl = cl;
    // Change mod so that the sum of modifier after following thread is correct.
    const diff = modsumcl - cl.mod - tree.c[0].msel;
    li.mod += diff;
    // Change preliminary x coordinate so that the node does not move.
    li.prelim -= diff;
    // Update extreme node and its sum of modifiers.
    tree.c[0].el = tree.c[i].el;
    tree.c[0].msel = tree.c[i].msel;
}

// Symmetrical to setLeftThread
function setRightThread(tree: Tree, i: number, sr: any, modsumsr: number) {
    const ri = tree.c[i].er as Tree;
    ri.tr = sr;
    const diff = modsumsr - sr.mod - tree.c[i].mser;
    ri.mod += diff;
    ri.prelim -= diff;
    tree.c[i].er = tree.c[i - 1].er;
    tree.c[i].mser = tree.c[i - 1].mser;
}

function seperate(tree: Tree, i: number, ih: IYL) {
    // Right contour node of left siblings and its sum of modifiers.
    let sr = tree.c[i - 1];
    let mssr = sr.mod;
    // Left contour node of right siblings and its sum of modifiers.
    let cl = tree.c[i];
    let mscl = cl.mod;
    while (sr !== null && cl !== null) {
        if (bottom(sr) > ih.lowY) {
            ih = ih.next as IYL;
        }
        // How far to the left of the right side of sr is the left side of cl.
        const distance = mssr + sr.prelim + sr.w - (mscl + cl.prelim);
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
                mssr += sr.mod;
            }
        }
        if (sy >= cy) {
            cl = nextLeftContour(cl);
            if (cl !== null) {
                mscl += cl.mod;
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

function positionRoot(tree: Tree) {
    // Position root between children, taking into account their mod.
    tree.prelim =
        (tree.c[0].prelim + tree.c[0].mod + tree.c[tree.cs - 1].mod + tree.c[tree.cs - 1].prelim + tree.c[tree.cs - 1].w) / 2 - tree.w / 2;
}

function firstWalk(tree: Tree) {
    if (tree.cs === 0) {
        setExtremes(tree);
        return;
    }
    firstWalk(tree.c[0]);
    // Create siblings in contour minimal vertical coordinate and index list
    let ih = updateIYL(bottom(tree.c[0].el as Tree), 0, null);
    for (let i = 1; i < tree.cs; i++) {
        firstWalk(tree.c[i]);
        // Store lowest vertical coordinate while extreme nodes still point in current subtree
        const minY = bottom(tree.c[i].er as Tree);
        seperate(tree, i, ih);
        ih = updateIYL(minY, i, ih);
    }
    positionRoot(tree);
    setExtremes(tree);
}

function addChildSpacing(tree: Tree) {
    let d = 0;
    let modsumdelta = 0;
    for (let i = 0; i < tree.cs; i++) {
        d += tree.c[i].shift;
        modsumdelta += d + tree.c[i].change;
        tree.c[i].mod += modsumdelta;
    }
}

function secondWalk(tree: Tree, modsum: number) {
    modsum += tree.mod;
    // Set absolute (no-relative) horizontal coordinates.
    tree.x = tree.prelim + modsum;
    addChildSpacing(tree);
    for (let i = 0; i < tree.cs; i++) {
        secondWalk(tree.c[i], modsum);
    }
}

function layout(tree: Tree) {
    firstWalk(tree);
    secondWalk(tree, 0);
}

export { layout };
