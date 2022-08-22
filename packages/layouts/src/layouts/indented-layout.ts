import { Node } from '../hierarchy/node';
import { OriginNode, LayoutOptions } from '../types';
import { BaseMindLayout } from './base-mind';

export class IndentedLayout extends BaseMindLayout {
    layout(treeData: OriginNode, options: LayoutOptions) {
        return this.treeLayout(treeData, options, true);
    }

    treeLayout(treeData: OriginNode, options: LayoutOptions, isHorizontal = false) {
        const root = new Node(treeData, options);
        this.convert(root, isHorizontal);
        seperate(root);
        console.log(root);
        return root;
    }

    protected convert(node: Node, isHorizontal: boolean, d = 0) {
        if (isHorizontal) {
            node.x = d;
            d = d + (node.width - node.hgap * 2) / 2 + 16;
        } else {
            node.y = d;
            d += node.height;
        }
        node.children.forEach(child => {
            this.convert(child, isHorizontal, d);
        });
    }
}

function seperate(root: Node) {
    let previousBottom = root.y + root.height - root.vgap;
    updateY(root);
    function updateY(node: Node) {
        node.children.forEach(child => {
            child.y = previousBottom + 8;
            previousBottom = child.y + child.height - child.vgap;
            updateY(child);
        });
    }
}
