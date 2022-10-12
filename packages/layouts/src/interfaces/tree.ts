import { BoundingBox, LayoutNode } from './node';

export class LayoutTree {
    width: number;
    height: number;
    y: number;
    children: LayoutTree[];
    childrenCount: number;
    x: number;
    preliminary: number;
    modifier: number; // 描述整个子树应该水平移动多少
    shift: number;
    change: number;
    tl: any;
    tr: any;
    el: LayoutTree | null;
    er: LayoutTree | null;
    msel: number;
    mser: number;
    origin: LayoutNode;

    constructor(width: number, height: number, y: number, children: LayoutTree[], origin: LayoutNode) {
        this.width = width;
        this.height = height;
        this.y = y;
        this.children = children;
        this.childrenCount = children.length;

        this.x = 0;
        this.preliminary = 0; // 初步的水平坐标
        this.modifier = 0;
        this.shift = 0;
        this.change = 0;
        this.tl = null; // Left thread
        this.tr = null; // Right thread
        this.el = null; // extreme left nodes
        this.er = null; // extreme right nodes
        //sum of modifiers at the extreme nodes
        this.msel = 0;
        this.mser = 0;
        this.origin = origin;
    }
}

export const buildLayoutTree = (root: LayoutNode, isHorizontal: boolean) => {
    const children: LayoutTree[] = [];
    root.children.forEach(child => {
        children.push(buildLayoutTree(child, isHorizontal));
    });
    if (isHorizontal && root.blackNode && root.blackNode.boundingBox) {
        root.blackNode.boundingBox = { ...root.blackNode.boundingBox, left: root.blackNode.boundingBox.top, right: root.blackNode.boundingBox.bottom, width: root.blackNode.boundingBox.height, height: root.blackNode.boundingBox.width } as BoundingBox;
        root.blackNode = { ...root.blackNode, x: root.blackNode.y, width: root.blackNode.height } as LayoutNode;
    }
    if (isHorizontal) return new LayoutTree(root.height, root.width, root.x, children, root);
    return new LayoutTree(root.width, root.height, root.y, children, root);
};
