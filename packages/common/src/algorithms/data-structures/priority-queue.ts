import { GraphVertex, PointNode } from './graph';

export class PriorityQueue {
    // list: { node: PointNode; priority: number }[];
    list: { node: GraphVertex; priority: number }[];

    constructor() {
        this.list = [];
    }

    // enqueue(item: { node: PointNode; priority: number }) {
    enqueue(item: { node: GraphVertex; priority: number }) {
        this.list.push(item);
        this.list = this.list.sort((item1, item2) => item1.priority - item2.priority);
    }

    dequeue() {
        return this.list.shift();
    }
}
