import { Point, distanceBetweenPointAndPoint } from '@plait/core';

export class PointNode {
    public distance = Number.MAX_SAFE_INTEGER;
    public adjacentNodes: Map<PointNode, number> = new Map();
    constructor(public data: Point) {}
}

// export class PointGraph {
//     private index: { [x: string]: { [y: string]: PointNode } } = {};

//     add(p: Point) {
//         const x = p[0];
//         const y = p[1];
//         const xs = x.toString(),
//             ys = y.toString();

//         if (!(xs in this.index)) {
//             this.index[xs] = {};
//         }
//         if (!(ys in this.index[xs])) {
//             this.index[xs][ys] = new PointNode(p);
//         }
//     }
//     connect(a: Point, b: Point) {
//         const nodeA = this.get(a);
//         const nodeB = this.get(b);

//         if (!nodeA || !nodeB) {
//             throw new Error(`A point was not found`);
//         }

//         nodeA.adjacentNodes.set(nodeB, 0);
//     }

//     has(p: Point): boolean {
//         const x = p[0];
//         const y = p[1];
//         const xs = x.toString(),
//             ys = y.toString();
//         return xs in this.index && ys in this.index[xs];
//     }

//     get(p: Point): PointNode | null {
//         const x = p[0];
//         const y = p[1];
//         const xs = x.toString(),
//             ys = y.toString();

//         if (xs in this.index && ys in this.index[xs]) {
//             return this.index[xs][ys];
//         }

//         return null;
//     }
// }

export class Graph {
    vertices: { [key: string]: GraphVertex } = {};
    edges: { [key: string]: GraphEdge } = {};

    constructor() {}
    addVertex(newVertex: GraphVertex) {
        this.vertices[newVertex.getKey()] = newVertex;
    }

    getVertexByKey(vertexKey: string) {
        return this.vertices[vertexKey];
    }

    addEdge(edge: GraphEdge) {
        // Try to find and end start vertices.
        let startVertex = this.getVertexByKey(edge.startVertex.getKey());
        let endVertex = this.getVertexByKey(edge.endVertex.getKey());

        // Insert start vertex if it wasn't inserted.
        if (!startVertex) {
            this.addVertex(edge.startVertex);
            startVertex = this.getVertexByKey(edge.startVertex.getKey());
        }

        // Insert end vertex if it wasn't inserted.
        if (!endVertex) {
            this.addVertex(edge.endVertex);
            endVertex = this.getVertexByKey(edge.endVertex.getKey());
        }

        // Check if edge has been already added.
        if (this.edges[edge.getKey()]) {
            throw new Error('Edge has already been added before');
        } else {
            this.edges[edge.getKey()] = edge;
        }

        startVertex.addEdge(edge);
        endVertex.addEdge(edge);

        return this;
    }
}

export class GraphVertex {
    value: Point;

    edges: GraphEdge[] = [];

    constructor(value: Point) {
        if (value === undefined) {
            throw new Error('Graph vertex must have a value');
        }
        this.value = value;
    }

    getKey() {
        return this.value.toString();
    }

    addEdge(edge: GraphEdge) {
        this.edges.push(edge);
        return this;
    }

    getNeighbors() {
        const neighborsConverter = (edge: GraphEdge) => {
            return edge.startVertex === this ? edge.endVertex : edge.startVertex;
        };
        return this.edges.map(neighborsConverter);
    }
}
export default class GraphEdge {
    constructor(public startVertex: GraphVertex, public endVertex: GraphVertex) {
        this.startVertex = startVertex;
        this.endVertex = endVertex;
    }

    getKey() {
        const startVertexKey = this.startVertex.getKey();
        const endVertexKey = this.endVertex.getKey();

        return `${startVertexKey}_${endVertexKey}`;
    }

    toString() {
        return this.getKey();
    }
}
