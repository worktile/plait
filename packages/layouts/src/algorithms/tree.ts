export class Tree {
    w: number;
    h: number;
    y: number;
    c: Tree[];
    cs: number;
    x: number;
    prelim: number;
    mod: number;
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
        this.w = width;
        this.h = height;
        this.y = y;
        this.c = children;
        this.cs = children.length;

        this.x = 0;
        this.prelim = 0; // 初步的水平坐标
        this.mod = 0;
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
