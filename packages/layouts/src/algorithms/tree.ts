export class Tree {
    width: number;
    height: number;
    y: number;
    children: Tree[];
    childrenCount: number;
    x: number;
    preliminary: number;
    modifier: number;// 描述整个子树应该水平移动多少
    shift: number;
    change: number;
    tl: any;
    tr: any;
    el: Tree | null;
    er: Tree | null;
    msel: number;
    mser: number;
    origin: any;

    constructor(width: number, height: number, y: number, children: Tree[], origin: any) {
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
