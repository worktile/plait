import { Point, RectangleClient } from '@plait/core';
import { _isOverlap, almostEqual, lineIntersects } from './math';

export class Graph {
    private _xMap = new Map<number, number[][]>();
    private _yMap = new Map<number, number[][]>();
    constructor(
        private points: number[][],
        private blocks: RectangleClient[] = [],
        private expandedBlocks: RectangleClient[] = [],
        private excludedPoints: number[][] = []
    ) {
        const xMap = this._xMap;
        const yMap = this._yMap;
        this.points.forEach(point => {
            const [x, y] = point;
            if (!xMap.has(x)) xMap.set(x, []);
            if (!yMap.has(y)) yMap.set(y, []);
            xMap.get(x)?.push(point);
            yMap.get(y)?.push(point);
        });
    }
    private _isBlock(sp: number[], ep: number[]) {
        return (
            this.blocks.some(block => {
                const rst = linePolygonIntersects(sp, ep, RectangleClient.getCornerPoints(block));
                return (
                    rst?.length === 2 ||
                    isPointInBound(sp as Point, block) ||
                    isPointInBound(ep as Point, block) ||
                    [
                        RectangleClient.getLeftLine(block),
                        RectangleClient.getUpperLine(block),
                        RectangleClient.getRightLine(block),
                        RectangleClient.getLowerLine(block)
                    ].some(line => {
                        return isOverlap(line, [sp, ep]);
                    })
                );
            }) ||
            this.expandedBlocks.some(block => {
                const rectangle = RectangleClient.getOutlineRectangle(block, -0.5);
                const result = linePolygonIntersects(sp, ep, RectangleClient.getCornerPoints(rectangle));
                return result?.length === 2;
            })
        );
    }

    neighbors(curPoint: number[]): number[][] {
        const [x, y] = curPoint;
        const neighbors = new Set<Point>();
        const xPoints = this._xMap.get(x);
        const yPoints = this._yMap.get(y);
        if (xPoints) {
            let plusMin = Infinity;
            let minusMin = Infinity;
            let plusPoint: Point | undefined;
            let minusPoint: Point | undefined;
            xPoints.forEach(point => {
                if (arrayAlmostEqual(point as Point, curPoint as Point)) return;
                const dif = point[1] - curPoint[1];
                if (dif > 0 && dif < plusMin) {
                    plusMin = dif;
                    plusPoint = point as Point;
                }
                if (dif < 0 && Math.abs(dif) < minusMin) {
                    minusMin = Math.abs(dif);
                    minusPoint = point as Point;
                }
            });
            if (plusPoint && (this._canSkipBlock(plusPoint) || !this._isBlock(curPoint, plusPoint))) {
                neighbors.add(plusPoint);
            }
            if (minusPoint && (this._canSkipBlock(minusPoint) || !this._isBlock(curPoint, minusPoint))) {
                neighbors.add(minusPoint);
            }
        }
        if (yPoints) {
            let plusMin = Infinity;
            let minusMin = Infinity;
            let plusPoint: Point | undefined;
            let minusPoint: Point | undefined;
            yPoints.forEach(point => {
                if (arrayAlmostEqual(point as Point, curPoint as Point)) return;
                const dif = point[0] - curPoint[0];
                if (dif > 0 && dif < plusMin) {
                    plusMin = dif;
                    plusPoint = point as Point;
                }
                if (dif < 0 && Math.abs(dif) < minusMin) {
                    minusMin = Math.abs(dif);
                    minusPoint = point as Point;
                }
            });
            if (plusPoint && (this._canSkipBlock(plusPoint) || !this._isBlock(curPoint, plusPoint))) {
                neighbors.add(plusPoint);
            }
            if (minusPoint && (this._canSkipBlock(minusPoint) || !this._isBlock(curPoint, minusPoint))) {
                neighbors.add(minusPoint);
            }
        }

        return Array.from(neighbors);
    }

    private _canSkipBlock(point: Point) {
        return this.excludedPoints.some(excludedPoint => {
            return arrayAlmostEqual(point, excludedPoint as Point);
        });
    }
}

export function linePolygonIntersects(sp: number[], ep: number[], points: number[][]): number[][] | null {
    const result: number[][] = [];
    const len = points.length;

    for (let i = 0; i < len; i++) {
        const p = points[i];
        const p2 = points[(i + 1) % len];
        const rst = lineIntersects(sp as Point, ep as Point, p as Point, p2 as Point);
        if (rst) {
            result.push(rst);
        }
    }

    return result.length ? result : null;
}

function isPointInBound([x, y]: Point, rectangle: RectangleClient, tolerance = 0.01) {
    return (
        x > rectangle.x + tolerance &&
        x < rectangle.x + rectangle.width - tolerance &&
        y > rectangle.y + tolerance &&
        y < rectangle.y + rectangle.height - tolerance
    );
}

function isOverlap(line: number[][], line2: number[][]) {
    if ([line[0][1], line[1][1], line2[0][1], line2[1][1]].every(y => almostEqual(y, line[0][1], 0.02))) {
        return _isOverlap(line, line2, 0);
    } else if ([line[0][0], line[1][0], line2[0][0], line2[1][0]].every(x => almostEqual(x, line[0][0], 0.02))) {
        return _isOverlap(line, line2, 1);
    }
    return false;
}

function arrayAlmostEqual(point: Point, point2: Point) {
    return almostEqual(point[0], point2[0]) && almostEqual(point[1], point2[1]);
}
