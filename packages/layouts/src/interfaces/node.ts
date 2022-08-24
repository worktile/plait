import { LayoutOptions, LayoutType, OriginNode } from '../types';
import { findLayoutType } from '../utils/layout';

export class LayoutNode {
    x = 0;
    y = 0;
    vGap = 0;
    hGap = 0;
    origin: OriginNode;
    width = 0;
    height = 0;
    depth = 0;
    children: LayoutNode[] = [];
    parent?: LayoutNode;
    left = false;
    up = false;
    layout: string;

    constructor(origin: OriginNode, options: LayoutOptions, parent?: LayoutNode, isolated?: boolean) {
        const hGap = options.getHorizontalGap(origin);
        const vGap = options.getVerticalGap(origin);
        this.origin = origin;
        this.width = options.getWidth(origin);
        this.height = options.getHeight(origin);
        this.x = this.y = 0;
        if (parent) {
            this.parent = parent;
        }
        this.layout = findLayoutType(this);
        this.addGap(hGap, vGap);
    }

    isRoot() {
        return this.depth === 0;
    }

    addGap(hGap: number, vGap: number) {
        const me = this;
        me.hGap += hGap;
        me.vGap += vGap;
        me.width += 2 * hGap;
        me.height += 2 * vGap;
    }

    eachNode(callback: (node: LayoutNode) => void) {
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
            node.left = true;
        });
        me.translate(bb.width, 0);
    }

    down2up() {
        const me = this;
        const bb = me.getBoundingBox();
        me.eachNode(node => {
            node.y = node.y - (node.y - bb.top) * 2 - node.height;
            node.up = true;
        });
        me.translate(0, bb.height);
    }
}

export function dfs(node: LayoutNode, callback: (node: LayoutNode) => void) {
    node.children.forEach(_node => {
        dfs(_node, callback);
    });
    callback(node);
}
