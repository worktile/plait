import { buildLayoutTree, LayoutTree } from '../interfaces/tree';
import { LayoutOptions, OriginNode } from '../types';
import { LayoutNode } from '../interfaces/node';
import { layout } from '../algorithms/non-overlapping-tree-layout';
import { IndentedLayout } from './indented-layout';

export class BaseMindLayout {
    constructor() {}

    /**
     * Layout treeData
     */
    layout(treeData: OriginNode, options: LayoutOptions) {
        throw new Error('please override this method');
    }



    protected baseLayout(treeData: OriginNode, options: LayoutOptions, isHorizontal = false) {
        // node tree
        const a: any = [];
        const root = this.buildLayoutNode(treeData, options, a);
        // update main axle coordinate
        this.convert(root, isHorizontal);
        // layout tree data structure
        const tree = buildLayoutTree(root, isHorizontal);
        // layout
        layout(tree);
        // convert layout tree to node tree
        this.convertBack(tree, root, isHorizontal);
        // a.forEach((indentedRoot: Node) => {
        //     const indentedLayout = new IndentedLayout();
        //     const node = indentedLayout.layout(indentedRoot.origin, options);
        //     node.parent = indentedRoot.parent;
        //     node.translate(indentedRoot.x, indentedRoot.y);
        //     if (indentedRoot.parent) {
        //         const index = indentedRoot.parent?.children.indexOf(indentedRoot) as number;
        //         indentedRoot.parent.children[index] = Object.assign(indentedRoot.parent.children[index], node);
        //     }
        // });
        return root;
    }

    buildLayoutNode(node: OriginNode, options: LayoutOptions, isolatedNodes: LayoutNode[]) {
        const root = new LayoutNode(node, options);
        // if (!root.origin.isCollapsed) {
        //     const nodes: LayoutNode[] = [root];
        //     let node: LayoutNode | undefined;
        //     while ((node = nodes.pop())) {
        //         if (!node.origin.isCollapsed) {
        //             const children = node.origin.children;
        //             const length = children ? children.length : 0;
        //             node.children = [];
        //             const layout = options.getLayout(node.origin);
        //             if (children && length) {
        //                 for (let i = 0; i < length; i++) {
        //                     const child = new LayoutNode(children[i], options);
        //                     node.children.push(child);
        //                     nodes.push(child);
        //                     child.parent = node;
        //                     child.depth = node.depth + 1;
        //                     const isolated = layout !== options.getLayout(children[i]);
        //                     if (isolated) {
        //                         isolatedNodes.push(child);
        //                     } else {
        //                         nodes.push(child)
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
        return root;
    }

    protected convert(node: LayoutNode, isHorizontal: boolean, d = 0) {
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

    protected convertBack(tree: LayoutTree, root: LayoutNode, isHorizontal: Boolean) {
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
