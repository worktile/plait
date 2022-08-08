import { OriginNode, LayoutOptions } from '../types';
import { BaseLayout } from './layout';
import { Node } from '../hierarchy/node';
import { wrap } from '../hierarchy/wrap';
import { layout } from '../algorithms/non-overlapping-tree-layout';

export class StandardLayout extends BaseLayout {
    layout(treeData: OriginNode, options: LayoutOptions) {
        const isHorizontal = true;
        const root = new Node(treeData, options);
        // separate into left and right trees
        const leftRoot = new Node(root.origin, options, true);
        const rightRoot = new Node(root.origin, options, true);
        const treeSize = treeData.children.length;
        const rightTreeSize = Math.round(treeSize / 2);
        for (let i = 0; i < treeSize; i++) {
            const child = root.children[i];
            if (i < rightTreeSize) {
                rightRoot.children.push(child);
            } else {
                leftRoot.children.push(child);
            }
        }
        this.convert(leftRoot, isHorizontal);
        this.convert(rightRoot, isHorizontal);
        const leftTree = wrap(leftRoot, isHorizontal);
        const rightTree = wrap(rightRoot, isHorizontal);
        layout(leftTree);
        layout(rightTree);
        this.convertBack(leftTree, leftRoot, isHorizontal);
        this.convertBack(rightTree, rightRoot, isHorizontal);
        leftRoot.right2left();
        rightRoot.translate(leftRoot.x - rightRoot.x, leftRoot.y - rightRoot.y);
        root.x = leftRoot.x;
        root.y = rightRoot.y;
        return root;
    }
}
