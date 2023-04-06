import { LayoutContext, LayoutOptions, LayoutType, MindmapLayoutType, OriginNode } from '../types';
import { findLayoutType } from '../utils/layout';

/**
 * abstract layout node
 */
export class LayoutNode {
    x = 0;
    y = 0;
    vGap = 0;
    hGap = 0;
    origin: OriginNode;
    blackNode?: LayoutBlockNode;
    width = 0;
    height = 0;
    depth = 0;
    children: LayoutNode[] = [];
    parent?: LayoutNode;
    left = false;
    up = false;
    layout: MindmapLayoutType;
    verticalConnectingPosition?: ConnectingPosition;

    constructor(origin: OriginNode, options: LayoutOptions, context: LayoutContext, parent?: LayoutNode) {
        const hGap = options.getHorizontalGap(origin, parent);
        const vGap = options.getVerticalGap(origin, parent);
        this.origin = origin;
        this.width = options.getWidth(origin);
        this.height = options.getHeight(origin);
        this.x = this.y = 0;
        if (parent) {
            this.parent = parent;
        }
        const layout = findLayoutType(this);
        this.layout = layout && layout !== MindmapLayoutType.standard ? layout : context.rootLayoutType;
        const verticalConnectingPosition = options.getVerticalConnectingPosition(origin, parent);
        if (verticalConnectingPosition) {
            this.verticalConnectingPosition = verticalConnectingPosition;
        }
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
        depthFirstRecursion(this, callback);
    }

    getBoundingBox(): BoundingBox {
        const bb: BoundingBox = {
            left: Number.MAX_VALUE,
            top: Number.MAX_VALUE,
            right: Number.MIN_VALUE,
            bottom: Number.MIN_VALUE,
            width: 0,
            height: 0
        };
        this.eachNode(node => {
            bb.left = Math.min(bb.left, node.x);
            bb.top = Math.min(bb.top, node.y);
            bb.right = Math.max(bb.right, node.x + node.width);
            bb.bottom = Math.max(bb.bottom, node.y + node.height);
        });
        bb.width = bb.right - bb.left;
        bb.height = bb.bottom - bb.top;
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

function depthFirstRecursion(node: LayoutNode, callback: (node: LayoutNode) => void) {
    node.children?.forEach(child => {
        depthFirstRecursion(child, callback);
    });
    callback(node);
}

export interface BoundingBox {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}

export class LayoutBlockNode {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
    rootX: number;
    rootY: number;
    rootWidth: number;
    rootHeight: number;

    constructor(
        left: number,
        right: number,
        top: number,
        bottom: number,
        width: number,
        height: number,
        rootX: number,
        rootY: number,
        rootWidth: number,
        rootHeight: number
    ) {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.width = width;
        this.height = height;
        this.rootX = rootX;
        this.rootY = rootY;
        this.rootWidth = rootWidth;
        this.rootHeight = rootHeight;
    }
}

export function toHorizontal(black: LayoutBlockNode): LayoutBlockNode {
    return {
        left: black.top,
        right: black.bottom,
        top: black.left,
        bottom: black.right,
        width: black.height,
        height: black.width,
        rootX: black.rootY,
        rootY: black.rootX,
        rootWidth: black.rootHeight,
        rootHeight: black.rootWidth
    };
}

/**
 * Connecting position, affecting horizontal layout
 */
export enum ConnectingPosition {
    middle = 'middle',
    bottom = 'bottom'
}

