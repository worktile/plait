import { PlaitBoard } from '../interfaces/board';
import { createG } from './dom/common';
import { PlaitElement } from '../interfaces/element';
import { Ancestor } from '../interfaces/node';
import { Point, RectangleClient, SELECTION_BORDER_COLOR } from '../interfaces';
import { depthFirstRecursion } from './tree';

export interface AlignRef {
    deltaX: number;
    deltaY: number;
    g: SVGGElement;
}

export interface DistributeRef {
    before: { distance: number; index: number }[];
    after: { distance: number; index: number }[];
}

const ALIGN_TOLERANCE = 2;

export class AlignReaction {
    alignRectangles: RectangleClient[];

    constructor(private board: PlaitBoard, private activeElements: PlaitElement[], private activeRectangle: RectangleClient) {
        this.alignRectangles = this.getAlignRectangle();
    }

    getAlignRectangle() {
        const result: RectangleClient[] = [];
        depthFirstRecursion<Ancestor>(
            this.board,
            node => {
                if (PlaitBoard.isBoard(node) || this.activeElements.some(element => node.id === element.id) || !this.board.isAlign(node)) {
                    return;
                }
                const rectangle = this.board.getRectangle(node);
                rectangle && result.push(rectangle);
            },
            node => {
                if (node && (PlaitBoard.isBoard(node) || this.board.isRecursion(node))) {
                    return true;
                } else {
                    return false;
                }
            },
            true
        );
        return result;
    }

    handleAlign(): AlignRef {
        const alignRectangles = this.getAlignRectangle();
        const g = createG();
        let alignLines = [];

        const offset = 12;
        let deltaX = 0;
        let deltaY = 0;
        let isCorrectX = false;
        let isCorrectY = false;

        for (let alignRectangle of alignRectangles) {
            const closestDistances = this.calculateClosestDistances(this.activeRectangle, alignRectangle);
            let canDrawHorizontal = false;
            if (!isCorrectX && closestDistances.absXDistance < ALIGN_TOLERANCE) {
                deltaX = closestDistances.xDistance;
                this.activeRectangle.x -= deltaX;
                isCorrectX = true;
                canDrawHorizontal = true;
            }

            if (closestDistances.absXDistance === 0) {
                canDrawHorizontal = true;
            }

            if (canDrawHorizontal) {
                const verticalY = [
                    alignRectangle.y,
                    alignRectangle.y + alignRectangle.height,
                    this.activeRectangle.y,
                    this.activeRectangle.y + this.activeRectangle.height
                ];
                const lineTopY = Math.min(...verticalY) - offset;
                const lineBottomY = Math.max(...verticalY) + offset;
                const leftLine = [this.activeRectangle.x, lineTopY, this.activeRectangle.x, lineBottomY];
                const middleLine = [
                    this.activeRectangle.x + this.activeRectangle.width / 2,
                    lineTopY,
                    this.activeRectangle.x + this.activeRectangle.width / 2,
                    lineBottomY
                ];
                const rightLine = [
                    this.activeRectangle.x + this.activeRectangle.width,
                    lineTopY,
                    this.activeRectangle.x + this.activeRectangle.width,
                    lineBottomY
                ];

                const shouldDrawLeftLine =
                    closestDistances.indexX === 0 ||
                    closestDistances.indexX === 1 ||
                    (closestDistances.indexX === 2 && this.activeRectangle.width === alignRectangle.width);
                if (shouldDrawLeftLine && !alignLines[0]) {
                    alignLines[0] = leftLine;
                }

                const shouldDrawRightLine =
                    closestDistances.indexX === 2 ||
                    closestDistances.indexX === 3 ||
                    (closestDistances.indexX === 0 && this.activeRectangle.width === alignRectangle.width);
                if (shouldDrawRightLine && !alignLines[2]) {
                    alignLines[2] = rightLine;
                }

                const shouldDrawMiddleLine = closestDistances.indexX === 4 || (!shouldDrawLeftLine && !shouldDrawRightLine);
                if (shouldDrawMiddleLine && !alignLines[1]) {
                    alignLines[1] = middleLine;
                }

                isCorrectX = true;
            }

            let canDrawVertical = false;
            if (!isCorrectY && closestDistances.absYDistance < ALIGN_TOLERANCE) {
                deltaY = closestDistances.yDistance;
                this.activeRectangle.y -= deltaY;
                isCorrectY = true;
                canDrawVertical = true;
            }
            if (closestDistances.absYDistance === 0) {
                canDrawVertical = true;
            }
            if (canDrawVertical) {
                const horizontalX = [
                    alignRectangle.x,
                    alignRectangle.x + alignRectangle.width,
                    this.activeRectangle.x,
                    this.activeRectangle.x + this.activeRectangle.width
                ];
                const lineLeftX = Math.min(...horizontalX) - offset;
                const lineRightX = Math.max(...horizontalX) + offset;
                const topLine = [lineLeftX, this.activeRectangle.y, lineRightX, this.activeRectangle.y];
                const horizontalMiddleLine = [
                    lineLeftX,
                    this.activeRectangle.y + this.activeRectangle.height / 2,
                    lineRightX,
                    this.activeRectangle.y + this.activeRectangle.height / 2
                ];
                const bottomLine = [
                    lineLeftX,
                    this.activeRectangle.y + this.activeRectangle.height,
                    lineRightX,
                    this.activeRectangle.y + this.activeRectangle.height
                ];

                const shouldDrawTopLine =
                    closestDistances.indexY === 0 ||
                    closestDistances.indexY === 1 ||
                    (closestDistances.indexY === 2 && this.activeRectangle.height === alignRectangle.height);
                if (shouldDrawTopLine && !alignLines[3]) {
                    alignLines[3] = topLine;
                }

                const shouldDrawBottomLine =
                    closestDistances.indexY === 2 ||
                    closestDistances.indexY === 3 ||
                    (closestDistances.indexY === 0 && this.activeRectangle.width === alignRectangle.width);
                if (shouldDrawBottomLine && !alignLines[5]) {
                    alignLines[5] = bottomLine;
                }

                const shouldDrawMiddleLine = closestDistances.indexY === 4 || (!shouldDrawTopLine && !shouldDrawBottomLine);
                if (shouldDrawMiddleLine && !alignLines[4]) {
                    alignLines[4] = horizontalMiddleLine;
                }
            }
        }

        const alignDeltaX = deltaX;
        const alignDeltaY = deltaY;

        this.activeRectangle.x += deltaX;
        this.activeRectangle.y += deltaY;
        const distributeHorizontalResult = this.alignDistribute(alignRectangles, true);
        const distributeVerticalResult = this.alignDistribute(alignRectangles, false);
        const distributeLines: Point[][] = [...distributeHorizontalResult.distributeLines, ...distributeVerticalResult.distributeLines];
        if (distributeHorizontalResult.delta) {
            deltaX = distributeHorizontalResult.delta;
            if (alignDeltaX !== deltaX) {
                alignLines[0] = [];
                alignLines[1] = [];
                alignLines[2] = [];
            }
        }

        if (distributeVerticalResult.delta) {
            deltaY = distributeVerticalResult.delta;
            if (alignDeltaY !== deltaY) {
                alignLines[3] = [];
                alignLines[4] = [];
                alignLines[5] = [];
            }
        }

        if (alignLines.length) {
            this.drawAlignLines(alignLines, g);
        }

        if (distributeLines.length) {
            this.drawDistributeLines(distributeLines, g);
        }

        return { deltaX, deltaY, g };
    }

    calculateClosestDistances(activeRectangle: RectangleClient, alignRectangle: RectangleClient) {
        const activeRectangleCenter = [activeRectangle.x + activeRectangle.width / 2, activeRectangle.y + activeRectangle.height / 2];
        const alignRectangleCenter = [alignRectangle.x + alignRectangle.width / 2, alignRectangle.y + alignRectangle.height / 2];

        const centerXDistance = activeRectangleCenter[0] - alignRectangleCenter[0];
        const centerYDistance = activeRectangleCenter[1] - alignRectangleCenter[1];

        const leftToLeft = activeRectangle.x - alignRectangle.x;
        const leftToRight = activeRectangle.x - (alignRectangle.x + alignRectangle.width);
        const rightToRight = activeRectangle.x + activeRectangle.width - (alignRectangle.x + alignRectangle.width);
        const rightToLeft = activeRectangle.x + activeRectangle.width - alignRectangle.x;

        const topToTop = activeRectangle.y - alignRectangle.y;
        const topToBottom = activeRectangle.y - (alignRectangle.y + alignRectangle.height);
        const bottomToTop = activeRectangle.y + activeRectangle.height - alignRectangle.y;
        const bottomToBottom = activeRectangle.y + activeRectangle.height - (alignRectangle.y + alignRectangle.height);

        const xDistances = [leftToLeft, leftToRight, rightToRight, rightToLeft, centerXDistance];
        const yDistances = [topToTop, topToBottom, bottomToBottom, bottomToTop, centerYDistance];

        const xDistancesAbs = xDistances.map(distance => Math.abs(distance));
        const yDistancesAbs = yDistances.map(distance => Math.abs(distance));

        const indexX = xDistancesAbs.indexOf(Math.min(...xDistancesAbs));
        const indexY = yDistancesAbs.indexOf(Math.min(...yDistancesAbs));

        return {
            absXDistance: xDistancesAbs[indexX],
            xDistance: xDistances[indexX],
            absYDistance: yDistancesAbs[indexY],
            yDistance: yDistances[indexY],
            indexX,
            indexY
        };
    }

    alignDistribute(alignRectangles: RectangleClient[], isHorizontal: boolean) {
        let distributeLines: any[] = [];
        let delta = 0;
        let rectangles: RectangleClient[] = [];
        const axis = isHorizontal ? 'x' : 'y';
        const side = isHorizontal ? 'width' : 'height';

        const activeRectangleCenter = this.activeRectangle[axis] + this.activeRectangle[side] / 2;
        alignRectangles.forEach(rec => {
            const isCross = isHorizontal ? isHorizontalCross(rec, this.activeRectangle) : isVerticalCross(rec, this.activeRectangle);
            if (isCross && !RectangleClient.isHit(rec, this.activeRectangle)) {
                rectangles.push(rec);
            }
        });
        rectangles = [...rectangles, this.activeRectangle].sort((a, b) => a[axis] - b[axis]);

        const refArray: DistributeRef[] = [];
        let distributeDistance = 0;
        let beforeIndex = undefined;
        let afterIndex = undefined;

        for (let i = 0; i < rectangles.length; i++) {
            for (let j = i + 1; j < rectangles.length; j++) {
                const before = rectangles[i];
                const after = rectangles[j];
                const distance = after[axis] - (before[axis] + before[side]);
                let dif = Infinity;
                if (refArray[i]?.after) {
                    refArray[i].after.push({ distance, index: j });
                } else {
                    refArray[i] = { ...refArray[i], after: [{ distance, index: j }] };
                }

                if (refArray[j]?.before) {
                    refArray[j].before.push({ distance, index: i });
                } else {
                    refArray[j] = { ...refArray[j], before: [{ distance, index: i }] };
                }

                //middle
                let _center = (before[axis] + before[side] + after[axis]) / 2;
                dif = Math.abs(activeRectangleCenter - _center);
                if (dif < ALIGN_TOLERANCE) {
                    distributeDistance = (after[axis] - (before[axis] + before[side]) - this.activeRectangle[side]) / 2;
                    delta = activeRectangleCenter - _center;
                    beforeIndex = i;
                    afterIndex = j;
                }

                //after
                const distanceRight = after[axis] - (before[axis] + before[side]);
                _center = after[axis] + after[side] + distanceRight + this.activeRectangle[side] / 2;
                dif = Math.abs(activeRectangleCenter - _center);
                if (!distributeDistance && dif < ALIGN_TOLERANCE) {
                    distributeDistance = distanceRight;
                    beforeIndex = j;
                    delta = activeRectangleCenter - _center;
                }

                //before
                const distanceBefore = after[axis] - (before[axis] + before[side]);
                _center = before[axis] - distanceBefore - this.activeRectangle[side] / 2;
                dif = Math.abs(activeRectangleCenter - _center);

                if (!distributeDistance && dif < ALIGN_TOLERANCE) {
                    distributeDistance = distanceBefore;
                    afterIndex = i;
                    delta = activeRectangleCenter - _center;
                }
            }
        }

        const activeIndex = rectangles.indexOf(this.activeRectangle);
        let beforeIndexes: number[] = [];
        let afterIndexes: number[] = [];
        if (beforeIndex !== undefined) {
            beforeIndexes.push(beforeIndex);
            findRectangle(distributeDistance, refArray[beforeIndex], 'before', beforeIndexes);
        }

        if (afterIndex !== undefined) {
            afterIndexes.push(afterIndex);
            findRectangle(distributeDistance, refArray[afterIndex], 'after', afterIndexes);
        }

        if (beforeIndexes.length || afterIndexes.length) {
            const indexArr = [...beforeIndexes.reverse(), activeIndex, ...afterIndexes];
            this.activeRectangle[axis] -= delta;
            for (let i = 1; i < indexArr.length; i++) {
                distributeLines.push(getLinePoints(rectangles[indexArr[i - 1]], rectangles[indexArr[i]]));
            }
        }

        function findRectangle(distance: number, ref: DistributeRef, direction: string, rectangleIndexes: number[]) {
            const arr = ref[direction as keyof DistributeRef];
            const index = refArray.indexOf(ref);
            if ((index === 0 && direction === 'before') || (index === refArray.length - 1 && direction === 'after')) return;
            for (let i = 0; i < arr.length; i++) {
                if (Math.abs(arr[i].distance - distance) < 0.1) {
                    rectangleIndexes.push(arr[i].index);
                    findRectangle(distance, refArray[arr[i].index], direction, rectangleIndexes);
                    return;
                }
            }
        }

        function getLinePoints(beforeRectangle: RectangleClient, afterRectangle: RectangleClient) {
            const oppositeAxis = axis === 'x' ? 'y' : 'x';
            const oppositeSide = side === 'width' ? 'height' : 'width';
            const align = [
                beforeRectangle[oppositeAxis],
                beforeRectangle[oppositeAxis] + beforeRectangle[oppositeSide],
                afterRectangle[oppositeAxis],
                afterRectangle[oppositeAxis] + afterRectangle[oppositeSide]
            ];
            const sortArr = align.sort((a, b) => a - b);
            const average = (sortArr[1] + sortArr[2]) / 2;
            const offset = 3;
            return isHorizontal
                ? [
                      [beforeRectangle.x + beforeRectangle.width + offset, average],
                      [afterRectangle.x - offset, average]
                  ]
                : [
                      [average, beforeRectangle.y + beforeRectangle.height + offset],
                      [average, afterRectangle.y - offset]
                  ];
        }
        return { delta, distributeLines };
    }

    drawAlignLines(lines: number[][], g: SVGGElement) {
        lines.forEach(points => {
            if (!points.length) return;
            const xAlign = PlaitBoard.getRoughSVG(this.board).line(points[0], points[1], points[2], points[3], {
                stroke: SELECTION_BORDER_COLOR,
                strokeWidth: 1,
                strokeLineDash: [4, 4]
            });
            g.appendChild(xAlign);
        });
    }

    drawDistributeLines(lines: Point[][], g: SVGGElement) {
        lines.forEach(line => {
            if (!line.length) return;
            let isHorizontal = line[0][1] === line[1][1];
            const yAlign = PlaitBoard.getRoughSVG(this.board).line(line[0][0], line[0][1], line[1][0], line[1][1], {
                stroke: SELECTION_BORDER_COLOR,
                strokeWidth: 1
            });
            g.appendChild(yAlign);

            line.forEach(point => {
                const barPoint = getBarPoint(point, isHorizontal);
                const bar = PlaitBoard.getRoughSVG(this.board).line(barPoint[0][0], barPoint[0][1], barPoint[1][0], barPoint[1][1], {
                    stroke: SELECTION_BORDER_COLOR,
                    strokeWidth: 1
                });
                g.appendChild(bar);
            });
        });
    }
}

function isHorizontalCross(rectangle: RectangleClient, other: RectangleClient) {
    return !(rectangle.y + rectangle.height < other.y || rectangle.y > other.y + other.height);
}

function isVerticalCross(rectangle: RectangleClient, other: RectangleClient) {
    return !(rectangle.x + rectangle.width < other.x || rectangle.x > other.x + other.width);
}
function getBarPoint(point: Point, isHorizontal: boolean) {
    return isHorizontal
        ? [
              [point[0], point[1] - 4],
              [point[0], point[1] + 4]
          ]
        : [
              [point[0] - 4, point[1]],
              [point[0] + 4, point[1]]
          ];
}
