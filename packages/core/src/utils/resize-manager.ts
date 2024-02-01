import { PlaitBoard } from '../interfaces/board';
import { createG } from './dom/common';
import { PlaitElement } from '../interfaces/element';
import { Ancestor } from '../interfaces/node';
import { Point, RectangleClient, SELECTION_BORDER_COLOR, Vector } from '../interfaces';
import { depthFirstRecursion } from './tree';

export interface ResizeAlignRef {
    deltaWidth: number;
    deltaHeight: number;
    g: SVGGElement;
}

const ALIGN_TOLERANCE = 2;

const EQUAL_SPACING = 10;

export class ResizeAlignReaction {
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

    handleAlign(vectorFactor: Vector): ResizeAlignRef {
        const alignRectangles = this.getAlignRectangle();
        const g = createG();
        let alignLines = [];
        
        let deltaWidth = 0;
        let deltaHeight = 0;
        let isCorrectWidth = false;
        let isCorrectHeight = false;
        let drawActiveHorizontal = false;
        let drawActiveVertical = false;

        for (let alignRectangle of alignRectangles) {
            const offsetWidth = this.activeRectangle.width - alignRectangle.width;
            const offsetHeight = this.activeRectangle.height - alignRectangle.height;
            const absOffsetWidth = Math.abs(offsetWidth);
            const absOffsetHeight = Math.abs(offsetHeight);

            let canDrawHorizontal = false;
            if (vectorFactor[0] !== 0) {
                if (!isCorrectWidth && absOffsetWidth < ALIGN_TOLERANCE) {
                    this.activeRectangle.width -= offsetWidth;
                    deltaWidth = offsetWidth * vectorFactor[0];
                    if (vectorFactor[0] === -1) {
                        this.activeRectangle.x -= deltaWidth;
                    }
                    isCorrectWidth = true;
                    canDrawHorizontal = true;
                }

                if (absOffsetWidth === 0) {
                    canDrawHorizontal = true;
                }

                if (canDrawHorizontal) {
                    const alignPoints: Point[] = getEqualLinePoints(alignRectangle, true);
                    if (!drawActiveHorizontal) {
                        const activePoints: Point[] = getEqualLinePoints(this.activeRectangle, true);
                        alignLines.push(activePoints);
                        drawActiveHorizontal = true;
                    }
                    alignLines.push(alignPoints);
                }
            }

            let canDrawVertical = false;
            if (vectorFactor[1] !== 0) {
                if (!isCorrectHeight && absOffsetHeight < ALIGN_TOLERANCE) {
                    this.activeRectangle.height -= offsetHeight;
                    deltaHeight = offsetHeight * vectorFactor[1];
                    if (vectorFactor[1] === -1) {
                        this.activeRectangle.y -= deltaHeight;
                    }
                    canDrawVertical = true;
                    isCorrectHeight = true;
                }

                if (absOffsetHeight === 0) {
                    canDrawVertical = true;
                }

                if (canDrawVertical) {
                    const alignPoints: Point[] = getEqualLinePoints(alignRectangle, false);
                    if (!drawActiveVertical) {
                        const activePoints: Point[] = getEqualLinePoints(this.activeRectangle, false);
                        alignLines.push(activePoints);
                        drawActiveVertical = true;
                    }
                    alignLines.push(alignPoints);
                }
            }
        }

        this.activeRectangle.width += deltaWidth;
        this.activeRectangle.height += deltaHeight;
        if (vectorFactor[0] === -1) {
            this.activeRectangle.x += deltaWidth;
        }
        if (vectorFactor[1] === -1) {
            this.activeRectangle.y += deltaHeight;
        }
        if (alignLines.length) {
            this.drawEqualLines(alignLines, g);
        }
        return { deltaWidth, deltaHeight, g };
    }

    drawEqualLines(lines: Point[][], g: SVGGElement) {
        lines.forEach(line => {
            if (!line.length) return;
            const yAlign = PlaitBoard.getRoughSVG(this.board).line(line[0][0], line[0][1], line[1][0], line[1][1], {
                stroke: SELECTION_BORDER_COLOR,
                strokeWidth: 1
            });
            g.appendChild(yAlign);
            line.forEach(point => {
                const barPoint = getBarPoint(point, !!Point.isHorizontal(line[0], line[1]));
                const bar = PlaitBoard.getRoughSVG(this.board).line(barPoint[0][0], barPoint[0][1], barPoint[1][0], barPoint[1][1], {
                    stroke: SELECTION_BORDER_COLOR,
                    strokeWidth: 1
                });
                g.appendChild(bar);
            });
        });
    }
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

function getEqualLinePoints(rectangle: RectangleClient, isHorizontal: boolean): Point[] {
    return isHorizontal
        ? [
              [rectangle.x, rectangle.y - EQUAL_SPACING],
              [rectangle.x + rectangle.width, rectangle.y - EQUAL_SPACING]
          ]
        : [
              [rectangle.x - EQUAL_SPACING, rectangle.y],
              [rectangle.x - EQUAL_SPACING, rectangle.y + rectangle.height]
          ];
}
