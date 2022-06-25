import { LayoutOptions, OriginNode } from '../types';

export class Node {
    x = 0;
    y = 0;
    vgap = 0;
    hgap = 0;
    origin: OriginNode;
    width = 0;
    height = 0;
    depth = 0;
    children: Node[] = [];
    parent?: Node;

    constructor(origin: OriginNode, options: LayoutOptions, isolated?: boolean) {
        const hgap = options.getHGap(origin);
        const vgap = options.getVGap(origin);
        this.origin = origin;

        this.width = options.getWidth(origin);
        this.height = options.getHeight(origin);
        this.x = this.y = 0;
        if (!isolated && !origin.isCollapsed) {
            const nodes: Node[] = [this];
            let node: Node | undefined;
            while ((node = nodes.pop())) {
                if (!node.origin.isCollapsed) {
                    const children = node.origin.children;
                    const length = children ? children.length : 0;
                    node.children = [];
                    if (children && length) {
                        for (let i = 0; i < length; i++) {
                            const child = new Node(children[i], options);
                            node.children.push(child);
                            nodes.push(child);
                            child.parent = node;
                            child.depth = node.depth + 1;
                        }
                    }
                }
            }
        }
        this.addGap(hgap, vgap);
    }

    isRoot() {
        return this.depth === 0;
    }

    addGap(hgap: number, vgap: number) {
        const me = this;
        me.hgap += hgap;
        me.vgap += vgap;
        me.width += 2 * hgap;
        me.height += 2 * vgap;
    }

    eachNode(callback: (node: Node) => void) {
        dfs(this, callback);
    }

    getBoundingBox() {
        const bb = {
            left: Number.MAX_VALUE,
            top: Number.MAX_VALUE,
            width: 0,
            height: 0
        };
        this.eachNode(node => {
            bb.left = Math.min(bb.left, node.x);
            bb.top = Math.min(bb.top, node.y);
            bb.width = Math.max(bb.width, node.x + node.width);
            bb.height = Math.max(bb.height, node.y + node.height);
        });
        return bb;
    }

    translate(tx = 0, ty = 0) {
        this.eachNode(node => {
            node.x += tx;
            node.y += ty;
        });
    }

    right2left() {
        const me = this;
        const bb = me.getBoundingBox();
        me.eachNode(node => {
            node.x = node.x - (node.x - bb.left) * 2 - node.width;
        });
        me.translate(bb.width, 0);
    }

    down2up() {
        const me = this;
        const bb = me.getBoundingBox();
        me.eachNode(node => {
            node.y = node.y - (node.y - bb.top) * 2 - node.height;
        });
        me.translate(0, bb.height);
    }
}

function dfs(node: Node, callback: (node: Node) => void) {
    node.children.forEach(_node => {
        dfs(_node, callback);
    });
    callback(node);
}
