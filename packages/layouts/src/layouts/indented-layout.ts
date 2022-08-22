import { Node } from '../hierarchy/node';
import { OriginNode, LayoutOptions } from '../types';
import { BaseMindLayout } from './base-mind';

export class IndentedLayout {
    layout(treeData: OriginNode, options: LayoutOptions) {
        return this.treeLayout(treeData, options);
    }

    treeLayout(treeData: OriginNode, options: LayoutOptions) {
        const root = new Node(treeData, options);
        this.convertX(root);
        seperate(root);
        console.log(root);
        return root;
    }

    protected convertX(node: Node, d = 0) {
        node.x = d;
        node.children.forEach(child => {
            this.convertX(child, node.x + node.width / 2);
        });
    }
}

function seperate(root: Node) {
    let previousBottom = root.y + root.height - root.vgap;
    updateY(root);
    function updateY(node: Node) {
        node.children.forEach(child => {
            child.y = previousBottom;
            previousBottom = child.y + child.height - child.vgap;
            updateY(child);
        });
    }
}
