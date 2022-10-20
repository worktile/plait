import { BoundingBox, LayoutNode, toHorizontal } from './node';

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
    leftThread: any;
    rightThread: any;
    leftExtreme: LayoutTree | null;
    rightExtreme: LayoutTree | null;
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
        this.leftThread = null;
        this.rightThread = null;
        this.leftExtreme = null;
        this.rightExtreme = null;
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
    if (isHorizontal) {
        if (root.blackNode) {
            root.blackNode = toHorizontal(root.blackNode);
        }
        return new LayoutTree(root.height, root.width, root.x, children, root);
    }
    return new LayoutTree(root.width, root.height, root.y, children, root);
};
