import { Point } from '@plait/core';

export class PointNode {
    public distance = Number.MAX_SAFE_INTEGER;
    public shortestPath: PointNode[] = [];
    public adjacentNodes: Map<PointNode, number> = new Map();
    constructor(public data: Point) {}
}

export class PointGraph {
    private index: { [x: string]: { [y: string]: PointNode } } = {};

    add(p: Point) {
        const x = p[0];
        const y = p[1];
        const xs = x.toString(),
            ys = y.toString();

        if (!(xs in this.index)) {
            this.index[xs] = {};
        }
        if (!(ys in this.index[xs])) {
            this.index[xs][ys] = new PointNode(p);
        }
    }
    connect(a: Point, b: Point) {
        const nodeA = this.get(a);
        const nodeB = this.get(b);

        if (!nodeA || !nodeB) {
            throw new Error(`A point was not found`);
        }

        nodeA.adjacentNodes.set(nodeB, distance(a, b));
    }

    has(p: Point): boolean {
        const x = p[0];
        const y = p[1];
        const xs = x.toString(),
            ys = y.toString();
        return xs in this.index && ys in this.index[xs];
    }

    get(p: Point): PointNode | null {
        const x = p[0];
        const y = p[1];
        const xs = x.toString(),
            ys = y.toString();

        if (xs in this.index && ys in this.index[xs]) {
            return this.index[xs][ys];
        }

        return null;
    }
}

function distance(a: Point, b: Point): number {
    return Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));
}
