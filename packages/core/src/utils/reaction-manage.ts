import { PlaitBoard } from '../interfaces/board';
import { createG } from '../utils/dom/common';
import { PlaitElement } from '../interfaces/element';
import { Ancestor } from '../interfaces/node';
import { RectangleClient, SELECTION_BORDER_COLOR } from '../interfaces';
import { depthFirstRecursion } from '../utils';

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

    handleAlign() {
        const alignRectangles = this.getAlignRectangle();
        const G = createG();
        const alignLines = [];
        const offset = 12;
        const options = {
            stroke: SELECTION_BORDER_COLOR,
            strokeWidth: 1,
            strokeLineDash: [4, 4]
        };
        const result = { x: 0, y: 0 };
        let isCorrectX = false;
        let isCorrectY = false;

        for (let alignRectangle of alignRectangles) {
            const closestDistances = this.calculateClosestDistances(this.activeRectangle, alignRectangle);
            let canDrawHorizontal = false;
            if (!isCorrectX && closestDistances.absXDistance < 5) {
                result.x = closestDistances.xDistance;
                this.activeRectangle.x -= result.x;
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
                result.y = closestDistances.yDistance;
                this.activeRectangle.y -= result.y;
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

        if (alignLines.length) {
            alignLines.forEach(points => {
                if (!points.length) return;
                const xAlign = PlaitBoard.getRoughSVG(this.board).line(points[0], points[1], points[2], points[3], options);
                G.appendChild(xAlign);
            });
        }

        return { G, result };
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
}
