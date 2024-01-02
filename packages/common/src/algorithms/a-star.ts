import { Point } from '@plait/core';
import { PointGraph, PointNode } from './data-structures/graph';
import { PriorityQueue } from './data-structures/priority-queue';

export class AStar {
    cameFrom: Map<PointNode, PointNode>;

    constructor(private graph: PointGraph) {
        this.cameFrom = new Map<PointNode, PointNode>();
    }

    heuristic(a: Point, b: Point) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }

    search(start: Point, end: Point, previousStart: Point) {
        const frontier = new PriorityQueue();
        const startNode = this.graph.get(start);
        this.cameFrom = new Map<PointNode, PointNode>();
        const costSoFar = new Map<PointNode, number>();
        costSoFar.set(startNode!, 0);
        frontier.enqueue({ node: startNode!, priority: 0 });
        while (frontier.list.length > 0) {
            var current = frontier.dequeue();

            if (!current) {
                throw new Error(`can't find current`);
            }
            const currentPoint = current!.node.data;
            if (currentPoint[0] === end[0] && currentPoint[1] === end[1]) {
                break;
            }
            current.node.adjacentNodes.forEach(next => {
                let newCost = costSoFar.get(current!.node)! + this.heuristic(next.data, current!.node.data);
                const previousNode = this.cameFrom.get(current!.node);
                // Inflection point weight, if an inflection point occurs, cost + 1 to avoid the inflection point path
                // Three points on a line to determine whether there is an inflection point
                const previousPoint = previousNode ? previousNode.data : previousStart;
                const x = previousPoint[0] === current?.node.data[0] && previousPoint[0] === next.data[0];
                const y = previousPoint[1] === current?.node.data[1] && previousPoint[1] === next.data[1];
                if (!x && !y) {
                    newCost = newCost + 1;
                }
                if (!costSoFar.has(next) || (costSoFar.get(next) && newCost < costSoFar.get(next)!)) {
                    costSoFar.set(next, newCost);
                    const priority = newCost + this.heuristic(next.data, end);
                    frontier.enqueue({ node: next, priority });
                    this.cameFrom.set(next, current!.node);
                }
            });
        }
    }

    getRoute(start: Point, end: Point) {
        const result = [];
        let temp = end;
        while (temp[0] !== start[0] || temp[1] !== start[1]) {
            const node = this.graph.get(temp);
            const preNode = this.cameFrom.get(node!);
            result.unshift(preNode!.data);
            temp = preNode!.data;
        }
        return result;
    }
}
