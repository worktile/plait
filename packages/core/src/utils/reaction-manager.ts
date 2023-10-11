import { PlaitBoard } from '../interfaces/board';
import { createG } from './dom/common';
import { PlaitElement } from '../interfaces/element';
import { Ancestor } from '../interfaces/node';
import { RectangleClient, SELECTION_BORDER_COLOR } from '../interfaces';
import { depthFirstRecursion } from './tree';

export interface AlignRef {
    deltaX: number;
    deltaY: number;
    g: SVGGElement;
}

export class ReactionManager {
    alignRectangles: RectangleClient[];

    constructor(private board: PlaitBoard, private activeElements: PlaitElement[], private activeRectangle: RectangleClient) {
        this.alignRectangles = this.getAlignRectangle();
    }

    getAlignRectangle() {
        const result: RectangleClient[] = [];
        depthFirstRecursion<Ancestor>(
            this.board,
            node => {
                if (PlaitBoard.isBoard(node) || this.activeElements.some(element => node.id === element.id) || node.type !== 'geometry') {
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
            if (!isCorrectX && closestDistances.absXDistance < 5) {
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
            if (!isCorrectY && closestDistances.absYDistance < 5) {
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
        this.activeRectangle.x += deltaX;
        const distributeHorizontalResult = this.alignDistributeHorizontal(alignRectangles);
        const distributeLines: number[][] = distributeHorizontalResult.distributeLines;
        if (distributeHorizontalResult.deltaX) {
            deltaX = distributeHorizontalResult.deltaX;
            if (alignDeltaX !== deltaX) {
                alignLines[0] = [];
                alignLines[1] = [];
                alignLines[2] = [];
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

    alignDistributeHorizontal(alignRectangles: RectangleClient[]) {
        let distributeLines: any[] = [];
        let deltaX = 0;
        let dif = Infinity;
        const activeRectangleCenterX = this.activeRectangle.x + this.activeRectangle.width / 2;
        let rectangles: RectangleClient[] = [];
        alignRectangles.forEach(rec => {
            if (isHorizontalCross(rec, this.activeRectangle) && !RectangleClient.isHit(rec, this.activeRectangle)) {
                rectangles.push(rec);
            }
        });
        rectangles = rectangles.sort((a, b) => a.x - b.x);

        const getLinePoints = (leftRectangle: RectangleClient, middleRectangle: RectangleClient, rightRectangle: RectangleClient) => {
            const leftVerticalY = [
                leftRectangle.y,
                leftRectangle.y + leftRectangle.height,
                middleRectangle.y,
                middleRectangle.y + middleRectangle.height
            ];
            const rightVerticalY = [
                middleRectangle.y,
                middleRectangle.y + middleRectangle.height,
                rightRectangle.y,
                rightRectangle.y + rightRectangle.height
            ];
            const leftSortArr = leftVerticalY.sort((a, b) => a - b);
            const rightSortArr = rightVerticalY.sort((a, b) => a - b);
            const leftY = (leftSortArr[1] + leftSortArr[2]) / 2;
            const rightY = (rightSortArr[1] + rightSortArr[2]) / 2;
            const leftLine = [leftRectangle.x + leftRectangle.width + 2, leftY, middleRectangle.x - 2, leftY];
            const rightLine = [middleRectangle.x + middleRectangle.width + 2, rightY, rightRectangle.x - 2, rightY];
            return [leftLine, rightLine];
        };

        for (let i = 0; i < rectangles.length; i++) {
            for (let j = i + 1; j < rectangles.length; j++) {
                let leftRectangle = rectangles[i],
                    rightRectangle = rectangles[j];
                if (!isHorizontalCross(leftRectangle, rightRectangle)) continue;
                if (RectangleClient.isHit(leftRectangle, rightRectangle)) continue;

                //middle
                let _centerX = (leftRectangle.x + leftRectangle.width + rightRectangle.x) / 2;
                dif = Math.abs(activeRectangleCenterX - _centerX);
                if (dif <= 5) {
                    deltaX = activeRectangleCenterX - _centerX;
                    const distance = (rightRectangle.x - (leftRectangle.x + leftRectangle.width) - this.activeRectangle.width) / 2;
                    const verticalY = [
                        leftRectangle.y,
                        leftRectangle.y + leftRectangle.height,
                        rightRectangle.y,
                        rightRectangle.y + rightRectangle.height
                    ];
                    const activeX = this.activeRectangle.x - deltaX;
                    const sortArr = verticalY.sort((a, b) => a - b);
                    const y = (sortArr[2] + sortArr[1]) / 2;
                    distributeLines = [];
                    distributeLines.push([leftRectangle.x + leftRectangle.width + 2, y, activeX - 2, y]);
                    distributeLines.push([activeX + this.activeRectangle.width + 2, y, rightRectangle.x - 2, y]);

                    this.findBefore(distance, rectangles, leftRectangle, distributeLines, true);
                    this.findRight(distance, rectangles, rightRectangle, distributeLines);
                    return { deltaX, distributeLines };
                }

                //right
                const distanceRight = rightRectangle.x - (leftRectangle.x + leftRectangle.width);
                _centerX = rightRectangle.x + rightRectangle.width + distanceRight + this.activeRectangle.width / 2;
                dif = Math.abs(activeRectangleCenterX - _centerX);
                if (dif <= 5) {
                    deltaX = activeRectangleCenterX - _centerX;
                    const lines = getLinePoints(leftRectangle, rightRectangle, {
                        ...this.activeRectangle,
                        x: this.activeRectangle.x - deltaX
                    });
                    distributeLines = [];
                    distributeLines.push(...lines);
                    this.findBefore(distanceRight, rectangles, leftRectangle, distributeLines, true);
                }

                //left
                const distanceLeft = rightRectangle.x - (leftRectangle.x + leftRectangle.width);
                _centerX = leftRectangle.x - distanceLeft - this.activeRectangle.width / 2;
                dif = Math.abs(activeRectangleCenterX - _centerX);

                if (dif <= 5) {
                    deltaX = activeRectangleCenterX - _centerX;
                    const lines = getLinePoints(
                        { ...this.activeRectangle, x: this.activeRectangle.x - deltaX },
                        leftRectangle,
                        rightRectangle
                    );
                    distributeLines = [];
                    distributeLines.push(...lines);
                    this.findRight(distanceLeft, rectangles, leftRectangle, distributeLines);
                }
            }
        }
        return { deltaX, distributeLines };
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

    drawDistributeLines(lines: number[][], g: SVGGElement) {
        lines.forEach(points => {
            if (!points.length) return;
            if (points[1] === points[3]) {
                const yAlign = PlaitBoard.getRoughSVG(this.board).line(points[0], points[1], points[2], points[3], {
                    stroke: SELECTION_BORDER_COLOR,
                    strokeWidth: 1
                });
                const bar1 = PlaitBoard.getRoughSVG(this.board).line(points[0], points[1] - 4, points[0], points[3] + 4, {
                    stroke: SELECTION_BORDER_COLOR,
                    strokeWidth: 1
                });
                const bar2 = PlaitBoard.getRoughSVG(this.board).line(points[2], points[1] - 4, points[2], points[3] + 4, {
                    stroke: SELECTION_BORDER_COLOR,
                    strokeWidth: 1
                });

                g.appendChild(yAlign);
                g.appendChild(bar1);
                g.appendChild(bar2);
            }
        });
    }

    findBefore(
        distance: number,
        rectangles: RectangleClient[],
        leftRectangle: RectangleClient,
        distributeLines: number[][],
        isHorizon: boolean
    ) {
        const axis = isHorizon ? 'x' : 'y';
        const oppositeAxis = isHorizon ? 'y' : 'x';
        const attribute = isHorizon ? 'width' : 'height';
        const oppositeAttribute = isHorizon ? 'height' : 'width';

        const leftIndex = rectangles.indexOf(leftRectangle);
        for (let i = 0; i < leftIndex; i++) {
            const leftDistance = leftRectangle[axis] - (rectangles[i][axis] + rectangles[i][attribute]);
            if (Math.abs(leftDistance - distance) < 0.1 && isHorizontalCross(leftRectangle, rectangles[i])) {
                const verticalY = [
                    leftRectangle[oppositeAxis],
                    leftRectangle[oppositeAxis] + leftRectangle[oppositeAttribute],
                    rectangles[i][oppositeAxis],
                    rectangles[i][oppositeAxis] + rectangles[i][oppositeAttribute]
                ];
                const sortArr = verticalY.sort((a, b) => a - b);
                const y = (sortArr[2] + sortArr[1]) / 2;
                distributeLines.push([rectangles[i][axis] + rectangles[i][attribute] + 2, y, leftRectangle[axis] - 2, y]);
                this.findBefore(distance, rectangles, rectangles[i], distributeLines, isHorizon);
            }
        }
    }

    findRight(distance: number, rectangles: RectangleClient[], rightRectangle: RectangleClient, distributeLines: number[][]) {
        const rightIndex = rectangles.indexOf(rightRectangle);
        for (let i = rightIndex + 1; i < rectangles.length; i++) {
            const rightDistance = rectangles[i].x - (rightRectangle.x + rightRectangle.width);
            if (Math.abs(rightDistance - distance) < 0.1) {
                const verticalY = [
                    rightRectangle.y,
                    rightRectangle.y + rightRectangle.height,
                    rectangles[i].y,
                    rectangles[i].y + rectangles[i].height
                ];
                const sortArr = verticalY.sort((a, b) => a - b);
                const y = (sortArr[1] + sortArr[2]) / 2;
                distributeLines.push([rightRectangle.x + rightRectangle.width + 2, y, rectangles[i].x - 2, y]);
                this.findRight(distance, rectangles, rectangles[i], distributeLines);
            }
        }
    }
}

function isHorizontalCross(rectangle: RectangleClient, other: RectangleClient) {
    return !(rectangle.y + rectangle.height < other.y || rectangle.y > other.y + other.height);
}
