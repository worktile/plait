import { Tree } from '../algorithms/tree';
import { LayoutOptions, OriginNode } from '../types';
import { Node } from '../hierarchy/node';
import { wrap } from '../hierarchy/wrap';
import { layout } from '../algorithms/non-overlapping-tree-layout';

export class BaseMindLayout {
    constructor() {}

    /**
     * Layout treeData
     */
    layout(treeData: OriginNode, options: LayoutOptions) {
        throw new Error('please override this method');
    }

    protected treeLayout(treeData: OriginNode, options: LayoutOptions, isHorizontal = false) {
        // node tree
        const root = new Node(treeData, options);
        // update main axle coordinate
        this.convert(root, isHorizontal);
        // layout tree data structure
        const tree = wrap(root, isHorizontal);
        // layout
        layout(tree);
        // convert layout tree to node tree
        this.convertBack(tree, root, isHorizontal);
        return root;
    }

    protected convert(node: Node, isHorizontal: boolean, d = 0) {
        if (isHorizontal) {
            node.x = d;
            d += node.width;
        } else {
            node.y = d;
            d += node.height;
        }
        node.children.forEach(child => {
            this.convert(child, isHorizontal, d);
        });
    }

    protected convertBack(tree: Tree, root: Node, isHorizontal: Boolean) {
        if (isHorizontal) {
            root.y = tree.x;
        } else {
            root.x = tree.x;
        }
        tree.children.forEach((child, i) => {
            this.convertBack(child, root.children[i], isHorizontal);
        });
    }
}
