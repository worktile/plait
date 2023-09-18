import { PlaitBoard, Point, RectangleClient, createG, drawCircle, getElementById } from '@plait/core';
import { PlaitGeometry, PlaitLine } from '../../interfaces';
import { Direction, getDirectionByPoint, getPoints, getRectangleByPoints } from '@plait/common';
import { Graph } from './graph';
import {
    _isOverlap,
    almostEqual,
    assertEquals,
    compare,
    cost,
    distanceToLineSegment,
    findAllMaximalIndexes,
    findAllMinimalIndexes,
    getDiagonalCount,
    heuristic,
    lineIntersects,
    lrp,
    pointAlmostEqual,
    sign
} from './math';
import { PriorityQueue } from './queue';

export class AStarRunner {
    private _cameFrom = new Map<number[], { from: number[][]; indexes: number[] }>();
    private _frontier!: PriorityQueue<number[], [number, number, number]>;

    private _graph: Graph;
    private _costSoFar = new Map<number[], number[]>();
    private _diagonalCount = new Map<number[], number[]>();
    private _pointPriority = new Map<number[], number[]>();
    private _current: number[] | null = null;
    private _complete = false;

    constructor(
        points: number[][],
        private _sp: number[],
        private _ep: number[],
        private _originalSp: number[],
        private _originalEp: number[],
        blocks: RectangleClient[] = [],
        expandBlocks: RectangleClient[] = []
    ) {
        this._sp[2] = 0;
        this._ep[2] = 0;
        this._originalEp[2] = 0;
        this._graph = new Graph([...points], blocks, expandBlocks);
        this._init();
    }
    private _init() {
        this._cameFrom.set(this._sp, { from: [this._originalSp], indexes: [-1] });
        this._cameFrom.set(this._originalSp, { from: [], indexes: [] });

        this._costSoFar.set(this._sp, [0]);
        this._diagonalCount.set(this._sp, [0]);
        this._pointPriority.set(this._sp, [0]);
        this._frontier = new PriorityQueue<number[], [number, number, number]>(compare);
        this._frontier.enqueue(this._sp, [0, 0, 0]);
    }

    private _neighbors(cur: number[]) {
        const neighbors = this._graph.neighbors(cur);
        const cameFroms = this._cameFrom.get(cur);
        assertExists(cameFroms);

        cameFroms.from.forEach(from => {
            const index = neighbors.findIndex(n => pointAlmostEqual(n, from));
            if (index >= 0) {
                neighbors.splice(index, 1);
            }
        });
        if (cur === this._ep) neighbors.push(this._originalEp);

        return neighbors;
    }

    public step() {
        if (this._complete) return;
        this._current = this._frontier.dequeue();
        const current = this._current;
        if (!current) {
            this._complete = true;
            return;
        }
        if (current === this._ep && pointAlmostEqual(this._ep, this._originalEp)) {
            this._originalEp = this._ep;
        }
        const neighbors = this._neighbors(current);

        for (let i = 0; i < neighbors.length; i++) {
            const next = neighbors[i];

            const curCosts = this._costSoFar.get(current);
            const curDiagonalCounts = this._diagonalCount.get(current);
            const curPointPriorities = this._pointPriority.get(current);
            const cameFroms = this._cameFrom.get(current);
            assertExists(curCosts);
            assertExists(curDiagonalCounts);
            assertExists(curPointPriorities);
            assertExists(cameFroms);
            const newCosts = curCosts.map(co => co + cost(current, next));

            const newDiagonalCounts = curDiagonalCounts.map(
                (count, index) => count + getDiagonalCount(next, current, cameFroms.from[index])
            );
            assertExists(next[2]);
            const newPointPriorities = curPointPriorities.map(pointPriority => pointPriority + next[2]);
            let index = -1;
            if (newCosts.length === 1) {
                index = 0;
            } else {
                const costsIndexes = findAllMinimalIndexes(
                    newCosts,
                    (a, b) => a + 0.01 < b,
                    (a, b) => almostEqual(a, b, 0.02)
                );
                if (costsIndexes.length === 1) {
                    index = costsIndexes[0];
                } else {
                    const diagonalCounts = costsIndexes.map(i => newDiagonalCounts[i]);
                    const diagonalCountsIndexes = findAllMinimalIndexes(
                        diagonalCounts,
                        (a, b) => a < b,
                        (a, b) => a === b
                    );
                    if (diagonalCountsIndexes.length === 1) {
                        index = costsIndexes[diagonalCountsIndexes[0]];
                    } else {
                        const pointPriorities = diagonalCountsIndexes.map(i => newPointPriorities[costsIndexes[i]]);
                        const pointPrioritiesIndexes = findAllMaximalIndexes(
                            pointPriorities,
                            (a, b) => a > b,
                            (a, b) => a === b
                        );
                        index = pointPrioritiesIndexes[0];
                    }
                }
            }
            const shouldEnqueue = !this._costSoFar.has(next);
            const nextCosts = this._costSoFar.get(next) ?? [];
            const nextDiagonalCounts = this._diagonalCount.get(next) ?? [];
            const nextPointPriorities = this._pointPriority.get(next) ?? [];
            const nextCameFrom = this._cameFrom.get(next) ?? { from: [], indexes: [] };
            nextCosts.push(newCosts[index]);
            nextDiagonalCounts.push(newDiagonalCounts[index]);
            nextPointPriorities.push(newPointPriorities[index]);
            nextCameFrom.from.push(current);
            nextCameFrom.indexes.push(index);

            const newDiagonalCount = newDiagonalCounts[index];
            const newPointPriority = newPointPriorities[index];
            const newCost = newCosts[index];

            this._costSoFar.set(next, nextCosts);
            this._diagonalCount.set(next, nextDiagonalCounts);
            this._pointPriority.set(next, nextPointPriorities);
            this._cameFrom.set(next, nextCameFrom);
            const newPriority: [number, number, number] = [newDiagonalCount, newPointPriority, newCost + heuristic(next, this._ep)];
            if (shouldEnqueue) {
                this._frontier.enqueue(next, newPriority);
            } else {
                const index = this._frontier.heap.findIndex(item => item.value === next);
                const old = this._frontier.heap[index];
                if (old) {
                    if (compare(newPriority, old.priority) < 0) {
                        old.priority = newPriority;
                        this._frontier.bubbleUp(index);
                    }
                } else {
                    this._frontier.enqueue(next, newPriority);
                }
            }
            if (pointAlmostEqual(current, this._ep) && pointAlmostEqual(next, this._originalEp)) {
                this._originalEp = next;
                this._complete = true;
                return;
            }
        }
    }

    public reset() {
        this._cameFrom.clear();
        this._costSoFar.clear();
        this._diagonalCount.clear();
        this._pointPriority.clear();
        this._complete = false;
        this._init();
    }

    public run() {
        while (!this._complete) {
            this.step();
        }
    }

    get path() {
        const result: number[][] = [];
        let current: null | number[] = this._complete ? this._originalEp : this._current;
        const nextIndexes = [0];
        while (current) {
            result.unshift(current);
            const froms = this._cameFrom.get(current);
            assertExists(froms);
            const index = nextIndexes.shift();
            assertExists(index);
            nextIndexes.push(froms.indexes[index]);
            current = froms.from[index];
        }
        return result;
    }
}

export function assertExists<T>(val: T | null | undefined, message: string | Error = 'val does not exist'): asserts val is T {
    if (val === null || val === undefined) {
        if (message instanceof Error) {
            throw message;
        }
        throw new Error(message);
    }
}

export const getPointsByAStar = (
    board: PlaitBoard,
    element: PlaitLine,
    start: Point,
    startDirection: Direction,
    end: Point,
    endDirection: Direction
) => {
    PlaitBoard.getElementActiveHost(board).childNodes.forEach(node => node.remove());
    const g = createG();

    const blocks: RectangleClient[] = [];
    const expandBlocks: RectangleClient[] = [];
    const sourceElement = getElementById<PlaitGeometry>(board, element.source.boundId!);
    const startBound = getRectangleByPoints((sourceElement as PlaitGeometry).points);
    startDirection = getDirectionByPoint(element.source.connection!, startDirection);
    startBound && blocks.push({ ...startBound });

    const targetElement = getElementById<PlaitGeometry>(board, element.target.boundId!);
    const endBound = getRectangleByPoints((targetElement as PlaitGeometry).points);
    endDirection = getDirectionByPoint(element.target.connection!, endDirection);
    endBound && blocks.push({ ...endBound });

    const { expandStartBound, expandEndBound } = getExpandRectangle(startBound, endBound);
    const { startOffset, endOffset } = computeOffset(startBound, endBound);
    const nextStartPoint = expandStartBound
        ? getNextPoint(start, startDirection, startOffset[0], startOffset[1], startOffset[2], startOffset[3])
        : start;
    const previousEndPoint = expandEndBound ? getNextPoint(end, endDirection, endOffset[0], endOffset[1], endOffset[2], endOffset[3]) : end;
    expandStartBound && expandBlocks.push({ ...expandStartBound });
    expandEndBound && expandBlocks.push({ ...expandEndBound });

    if (startBound && expandStartBound && RectangleClient.isHit(expandStartBound, RectangleClient.toRectangleClient([end, end]))) {
        return getPoints(start, startDirection, end, endDirection, 30);
    }
    if (endBound && expandEndBound && RectangleClient.isHit(expandEndBound, RectangleClient.toRectangleClient([start, start]))) {
        return getPoints(start, startDirection, end, endDirection, 30);
    }

    const points = computePoints(start, nextStartPoint, end, previousEndPoint, startBound, expandStartBound, endBound, expandEndBound);
    points[0].forEach(p => {
        const circle = drawCircle(PlaitBoard.getRoughSVG(board), p as Point, 4, {
            stroke: 'red',
            strokeWidth: 1,
            fill: 'red',
            fillStyle: 'solid'
        });
        g.appendChild(circle);
    });
    PlaitBoard.getElementActiveHost(board).appendChild(g);
    // expandStartBound && PlaitBoard.getHost(board).appendChild(drawRectangle(board, expandStartBound, { stroke: '#000', strokeWidth: 3 }));

    return handlePoints(points, blocks, expandBlocks, startBound, endBound) as Point[];
};

function getNextPoint(point: Point, direction: Direction, offsetX = 10, offsetY = 10, offsetW = 10, offsetH = 10) {
    if (direction === Direction.left) {
        return [point[0] - offsetX + 2, point[1]];
    } else if (direction === Direction.top) {
        return [point[0], point[1] - offsetY + 2];
    } else if (direction === Direction.right) {
        return [point[0] + offsetW - 2, point[1]];
    } else if (direction === Direction.bottom) {
        return [point[0], point[1] + offsetH - 2];
    }
    return point;
}

function getConnectablePoints(
    startPoint: number[],
    endPoint: number[],
    nextStartPoint: number[],
    previousEndPoint: number[],
    startBound: RectangleClient | null,
    endBound: RectangleClient | null,
    expandStartBound: RectangleClient | null,
    expandEndBound: RectangleClient | null
) {
    const lineBound = getRectangleByPoints([transformToPoint(startPoint), transformToPoint(endPoint)]);
    const outerBound =
        expandStartBound &&
        expandEndBound &&
        getRectangleByPoints([...RectangleClient.getCornerPoints(expandStartBound), ...RectangleClient.getCornerPoints(expandEndBound)]);
    let points: number[][] = [nextStartPoint, previousEndPoint];
    pushWithPriority(points, getVerticesAndMidpoints(lineBound));
    if (outerBound) {
        pushOuterPoints(points, expandStartBound, expandEndBound, outerBound);
    }

    if (startBound && endBound) {
        assertExists(expandStartBound);
        assertExists(expandEndBound);
        pushGapMidPoint(points, startPoint, startBound, endBound, expandStartBound, expandEndBound);
        pushGapMidPoint(points, endPoint, endBound, startBound, expandEndBound, expandStartBound);
        pushBoundMidPoint(points, startBound, endBound, expandStartBound, expandEndBound);
        pushBoundMidPoint(points, endBound, startBound, expandEndBound, expandStartBound);
    }

    if (expandStartBound) {
        pushWithPriority(points, getVerticesAndMidpoints(expandStartBound));
        const rect = includePoint(expandStartBound, previousEndPoint);
        pushWithPriority(points, RectangleClient.getCornerPoints(rect));
    }

    if (expandEndBound) {
        pushWithPriority(points, getVerticesAndMidpoints(expandEndBound));
        const rect = includePoint(expandEndBound, nextStartPoint);
        pushWithPriority(points, RectangleClient.getCornerPoints(rect));
    }

    points = removeDuplicatePoints(points);
    const sorted = points.map(point => point[0] + ',' + point[1]).sort();
    sorted.forEach((cur, index) => {
        if (index === 0) return;
        if (cur === sorted[index - 1]) {
            throw new Error('duplicate point');
        }
    });
    const startEnds = [nextStartPoint, previousEndPoint].map(point => {
        return points.find(item => almostEqual(item[0], point[0], 0.02) && almostEqual(item[1], point[1], 0.02));
    }) as number[][];
    assertExists(startEnds[0]);
    assertExists(startEnds[1]);
    return { points, nextStartPoint: startEnds[0], previousEndPoint: startEnds[1] };
}

function computePoints(
    startPoint: number[],
    nextStartPoint: number[],
    endPoint: number[],
    previousEndPoint: number[],
    startBound: RectangleClient | null,
    expandStartBound: RectangleClient | null,
    endBound: RectangleClient | null,
    expandEndBound: RectangleClient | null
) {
    startPoint = downscalePrecision(startPoint);
    endPoint = downscalePrecision(endPoint);
    nextStartPoint = downscalePrecision(nextStartPoint);
    previousEndPoint = downscalePrecision(previousEndPoint);
    const result = getConnectablePoints(
        startPoint,
        endPoint,
        nextStartPoint,
        previousEndPoint,
        startBound,
        endBound,
        expandStartBound,
        expandEndBound
    );
    const points = result.points;
    nextStartPoint = result.nextStartPoint;
    previousEndPoint = result.previousEndPoint;

    const tempStartBound = expandStartBound ? RectangleClient.getOutlineRectangle(expandStartBound, 2) : null;
    const tempEndBound = expandEndBound ? RectangleClient.getOutlineRectangle(expandEndBound, 2) : null;

    const finalPoints = filterConnectablePoints(filterConnectablePoints(points, tempStartBound ?? null), tempEndBound ?? null);
    return [finalPoints, startPoint, endPoint, nextStartPoint, previousEndPoint];
}

function handlePoints(
    points: (number[] | number[][])[],
    blocks: RectangleClient[],
    expandBlocks: RectangleClient[],
    startBound: RectangleClient,
    endBound: RectangleClient
) {
    const finalPoints = points[0];
    const [, startPoint, endPoint, nextStartPoint, lastEndPoint] = points;
    adjustStartEndPoint(startPoint as number[], endPoint as number[], startBound, endBound);
    const _aStarRunner = new AStarRunner(
        finalPoints as number[][],
        nextStartPoint as number[],
        lastEndPoint as number[],
        startPoint as number[],
        endPoint as number[],
        blocks,
        expandBlocks
    );
    _aStarRunner.run();
    let path = _aStarRunner.path;
    if (!endBound) path.pop();
    if (!startBound) path.shift();
    path = mergePath(path);
    return path;
}

function mergePath(points: number[][]) {
    if (points.length === 0) return [];
    const result: number[][] = [[points[0][0], points[0][1]]];
    for (let i = 1; i < points.length - 1; i++) {
        const cur = points[i];
        const last = points[i - 1];
        const next = points[i + 1];
        if (almostEqual(last[0], cur[0], 0.02) && almostEqual(cur[0], next[0], 0.02)) continue;
        if (almostEqual(last[1], cur[1], 0.02) && almostEqual(cur[1], next[1], 0.02)) continue;
        result.push([cur[0], cur[1]]);
    }
    result.push([points[points.length - 1][0], points[points.length - 1][1]]);
    for (let i = 0; i < result.length - 1; i++) {
        const cur = result[i];
        const next = result[i + 1];
        try {
            assertEquals(almostEqual(cur[0], next[0], 0.02) || almostEqual(cur[1], next[1], 0.02), true);
        } catch (e) {
            console.log(points);
            console.log(result);
        }
    }
    return result;
}

function transformToPoint(numbers: number[]) {
    return [numbers[0], numbers[1]] as Point;
}

function adjustStartEndPoint(
    startPoint: number[],
    endPoint: number[],
    startBound: RectangleClient | null = null,
    endBound: RectangleClient | null = null
) {
    if (!endBound) {
        if (Math.abs(endPoint[0] - startPoint[0]) > Math.abs(endPoint[1] - startPoint[1])) {
            endPoint[0] += sign(endPoint[0] - startPoint[0]) * 20;
        } else {
            endPoint[1] += sign(endPoint[1] - startPoint[1]) * 20;
        }
    }
    if (!startBound) {
        if (Math.abs(endPoint[0] - startPoint[0]) > Math.abs(endPoint[1] - startPoint[1])) {
            startPoint[0] -= sign(endPoint[0] - startPoint[0]) * 20;
        } else {
            startPoint[1] -= sign(endPoint[1] - startPoint[1]) * 20;
        }
    }
}

function downscalePrecision(point: number[]) {
    return [Number(point[0].toFixed(2)), Number(point[1].toFixed(2)), point[2] ?? 0];
}

function removeDuplicatePoints(points: number[][]) {
    points = points.map(downscalePrecision);
    points.sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < points.length - 1; i++) {
        const cur = points[i];
        const last = points[i - 1];
        if (almostEqual(cur[0], last[0], 0.02)) {
            cur[0] = last[0];
        }
    }
    points.sort((a, b) => a[1] - b[1]);
    for (let i = 1; i < points.length - 1; i++) {
        const cur = points[i];
        const last = points[i - 1];
        if (almostEqual(cur[1], last[1], 0.02)) {
            cur[1] = last[1];
        }
    }
    points.sort((a, b) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        if (a[1] < b[1]) return -1;
        if (a[1] > b[1]) return 1;
        return 0;
    });
    for (let i = 1; i < points.length; i++) {
        const cur = points[i];
        const last = points[i - 1];
        if (almostEqual(cur[0], last[0], 0.02) && almostEqual(cur[1], last[1], 0.02)) {
            points.splice(i - 1, 1);
            i--;
            continue;
        }
    }
    return points;
}

function pushWithPriority(points: number[][], vecs: number[][], priority = 0) {
    points.push(...vecs.map(vec => [...vec, priority]));
}

function getVerticesAndMidpoints(rectangle: RectangleClient) {
    return [...RectangleClient.getCornerPoints(rectangle), ...RectangleClient.getEdgeCenterPoints(rectangle)];
}

function includePoint(rectangle: RectangleClient, point: number[]) {
    const x1 = Math.min(rectangle.x, point[0]),
        y1 = Math.min(rectangle.y, point[1]),
        x2 = Math.max(rectangle.x + rectangle.width, point[0]),
        y2 = Math.max(rectangle.y + rectangle.height, point[1]);
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

function filterConnectablePoints(points: number[][], bound: RectangleClient | null) {
    return points.filter(point => {
        if (!bound) return true;
        point = transformToPoint(point);
        const rangeRectangle = RectangleClient.toRectangleClient([point as Point, point as Point]);
        const isHit = RectangleClient.isHit(bound, rangeRectangle);
        return !isHit;
    });
}

function pushOuterPoints(
    points: number[][],
    expandStartBound: RectangleClient,
    expandEndBound: RectangleClient,
    outerBound: RectangleClient
) {
    if (expandStartBound && expandEndBound && outerBound) {
        pushWithPriority(points, getVerticesAndMidpoints(outerBound));
        pushWithPriority(points, [RectangleClient.getCenterPoint(outerBound)], 2);
        [
            RectangleClient.getUpperLine(expandStartBound),
            RectangleClient.getHorizontalLine(expandStartBound),
            RectangleClient.getLowerLine(expandStartBound),
            RectangleClient.getUpperLine(expandEndBound),
            RectangleClient.getHorizontalLine(expandEndBound),
            RectangleClient.getLowerLine(expandEndBound)
        ].forEach(line => {
            pushLineIntersectsToPoints(points, line, RectangleClient.getLeftLine(outerBound), 0);
            pushLineIntersectsToPoints(points, line, RectangleClient.getRightLine(outerBound), 0);
        });
        [
            RectangleClient.getLeftLine(expandStartBound),
            RectangleClient.getVerticalLine(expandStartBound),
            RectangleClient.getRightLine(expandStartBound),
            RectangleClient.getLeftLine(expandEndBound),
            RectangleClient.getVerticalLine(expandEndBound),
            RectangleClient.getRightLine(expandEndBound)
        ].forEach(line => {
            pushLineIntersectsToPoints(points, line, RectangleClient.getUpperLine(outerBound), 0);
            pushLineIntersectsToPoints(points, line, RectangleClient.getLowerLine(outerBound), 0);
        });
    }
}

function pushGapMidPoint(
    points: number[][],
    point: number[],
    bound: RectangleClient,
    bound2: RectangleClient,
    expandBound: RectangleClient,
    expandBound2: RectangleClient
) {
    /** on top or on bottom */
    if (almostEqual(point[1], bound.y, 0.02) || almostEqual(point[1], bound.y + bound.height, 0.02)) {
        const rst = [
            RectangleClient.getUpperLine(bound),
            RectangleClient.getLowerLine(bound),
            RectangleClient.getUpperLine(bound2),
            RectangleClient.getLowerLine(bound2)
        ].map(line => {
            return lineIntersects(point, [point[0], point[1] + 1], line[0], line[1], true);
        }) as number[][];
        rst.sort((a, b) => a[1] - b[1]);
        const midPoint = lrp(rst[1], rst[2], 0.5);
        pushWithPriority(points, [midPoint], 6);
        [
            RectangleClient.getLeftLine(expandBound),
            RectangleClient.getRightLine(expandBound),
            RectangleClient.getLeftLine(expandBound2),
            RectangleClient.getRightLine(expandBound2)
        ].forEach(line => {
            pushLineIntersectsToPoints(points, [midPoint, [midPoint[0] + 1, midPoint[1]]], line, 0);
        });
    } else {
        const rst = [
            RectangleClient.getLeftLine(bound),
            RectangleClient.getRightLine(bound),
            RectangleClient.getLeftLine(bound2),
            RectangleClient.getRightLine(bound2)
        ].map(line => {
            return lineIntersects(point, [point[0] + 1, point[1]], line[0], line[1], true);
        }) as number[][];
        rst.sort((a, b) => a[0] - b[0]);
        const midPoint = lrp(rst[1], rst[2], 0.5);
        pushWithPriority(points, [midPoint], 6);
        [
            RectangleClient.getUpperLine(expandBound),
            RectangleClient.getLowerLine(expandBound),
            RectangleClient.getUpperLine(expandBound2),
            RectangleClient.getLowerLine(expandBound2)
        ].forEach(line => {
            pushLineIntersectsToPoints(points, [midPoint, [midPoint[0], midPoint[1] + 1]], line, 0);
        });
    }
}

function pushBoundMidPoint(
    points: number[][],
    bound1: RectangleClient,
    bound2: RectangleClient,
    expandBound1: RectangleClient,
    expandBound2: RectangleClient
) {
    if (bound1.x + bound1.width < bound2.x) {
        const midX = (bound1.x + bound1.width + bound2.x) / 2;
        [
            RectangleClient.getHorizontalLine(expandBound1),
            RectangleClient.getHorizontalLine(expandBound2),
            RectangleClient.getUpperLine(expandBound1),
            RectangleClient.getLowerLine(expandBound1),
            RectangleClient.getUpperLine(expandBound2),
            RectangleClient.getLowerLine(expandBound2)
        ].forEach((line, index) => {
            pushLineIntersectsToPoints(
                points,
                line,
                [
                    [midX, 0],
                    [midX, 1]
                ],
                index === 0 || index === 1 ? 6 : 3
            );
        });
    }
    if (bound1.y + bound1.height < bound2.y) {
        const midY = (bound1.y + bound1.height + bound2.y) / 2;
        [
            RectangleClient.getVerticalLine(expandBound1),
            RectangleClient.getVerticalLine(expandBound2),
            RectangleClient.getLeftLine(expandBound1),
            RectangleClient.getRightLine(expandBound1),
            RectangleClient.getLeftLine(expandBound2),
            RectangleClient.getRightLine(expandBound2)
        ].forEach((line, index) => {
            pushLineIntersectsToPoints(
                points,
                line,
                [
                    [0, midY],
                    [1, midY]
                ],
                index === 0 || index === 1 ? 6 : 3
            );
        });
    }
}

function pushLineIntersectsToPoints(points: number[][], aLine: number[][], bLine: number[][], priority = 0) {
    const rst = lineIntersects(aLine[0], aLine[1], bLine[0], bLine[1], true);
    if (rst) {
        pushWithPriority(points, [rst], priority);
    }
}

const getExpandRectangle = (startBound: RectangleClient | null, endBound: RectangleClient | null) => {
    const { startOffset, endOffset } = computeOffset(startBound, endBound);
    const expandStartBound: RectangleClient | null =
        startBound && RectangleClient.expand(startBound, startOffset[0], startOffset[1], startOffset[2], startOffset[3]);
    const expandEndBound: RectangleClient | null =
        endBound && RectangleClient.expand(endBound, endOffset[0], endOffset[1], endOffset[2], endOffset[3]);
    return { expandStartBound, expandEndBound };
};

const computeOffset = (startBound: RectangleClient | null, endBound: RectangleClient | null) => {
    const startOffset = [20, 20, 20, 20];
    const endOffset = [20, 20, 20, 20];
    if (!(startBound && endBound)) return { startOffset, endOffset };
    let overlap = _isOverlap(RectangleClient.getUpperLine(startBound), RectangleClient.getLowerLine(endBound), 0, false);
    let dist: number;
    if (overlap && RectangleClient.getUpperLine(startBound)[0][1] > RectangleClient.getLowerLine(endBound)[0][1]) {
        dist = distanceToLineSegment(
            RectangleClient.getUpperLine(startBound)[0],
            RectangleClient.getUpperLine(startBound)[1],
            RectangleClient.getLowerLine(endBound)[0],
            false
        );
        startOffset[1] = Math.max(Math.min(dist / 2, startOffset[1]), 0);
    }

    overlap = _isOverlap(RectangleClient.getRightLine(startBound), RectangleClient.getLeftLine(endBound), 1, false);
    if (overlap && RectangleClient.getRightLine(startBound)[0][0] < RectangleClient.getLeftLine(endBound)[0][0]) {
        dist = distanceToLineSegment(
            RectangleClient.getRightLine(startBound)[0],
            RectangleClient.getRightLine(startBound)[1],
            RectangleClient.getLeftLine(endBound)[0],
            false
        );
        startOffset[2] = Math.max(Math.min(dist / 2, startOffset[2]), 0);
    }

    overlap = _isOverlap(RectangleClient.getLowerLine(startBound), RectangleClient.getUpperLine(endBound), 0, false);
    if (overlap && RectangleClient.getLowerLine(startBound)[0][1] < RectangleClient.getUpperLine(endBound)[0][1]) {
        dist = distanceToLineSegment(
            RectangleClient.getLowerLine(startBound)[0],
            RectangleClient.getLowerLine(startBound)[1],
            RectangleClient.getUpperLine(endBound)[0],
            false
        );
        startOffset[3] = Math.max(Math.min(dist / 2, startOffset[3]), 0);
    }

    startOffset[0] = endOffset[2] = Math.min(startOffset[0], endOffset[2]) === 0 ? 20 : Math.min(startOffset[0], endOffset[2]);
    startOffset[1] = endOffset[3] = Math.min(startOffset[1], endOffset[3]) === 0 ? 20 : Math.min(startOffset[1], endOffset[3]);
    startOffset[2] = endOffset[0] = Math.min(startOffset[2], endOffset[0]) === 0 ? 20 : Math.min(startOffset[2], endOffset[0]);
    startOffset[3] = endOffset[1] = Math.min(startOffset[3], endOffset[1]) === 0 ? 20 : Math.min(startOffset[3], endOffset[1]);

    return { startOffset, endOffset };
};
