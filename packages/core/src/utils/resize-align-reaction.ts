import { PlaitBoard } from '../interfaces/board';
import { createG } from './dom/common';
import { PlaitElement } from '../interfaces/element';
import { Point, RectangleClient, SELECTION_BORDER_COLOR } from '../interfaces';
import { findElements } from './element';

export interface ResizeAlignRef {
    deltaWidth: number;
    deltaHeight: number;
    g: SVGGElement;
}

export interface ResizeAlignOptions {
    resizeDirectionFactors: [number, number];
    isMaintainAspectRatio: boolean;
}

const ALIGN_TOLERANCE = 2;

const EQUAL_SPACING = 10;

export class ResizeAlignReaction {
    constructor(private board: PlaitBoard, private activeElements: PlaitElement[], private activeRectangle: RectangleClient) {}

    getAlignRectangle() {
        const elements = findElements(this.board, {
            match: element => this.board.isAlign(element) && !this.activeElements.some(item => item.id === element.id),
            recursion: () => false,
            isReverse: false
        });
        return elements.map(item => this.board.getRectangle(item)!);
    }

    handleAlign(resizeAlignOptions: ResizeAlignOptions): ResizeAlignRef {
        const alignRectangles = this.getAlignRectangle();
        const g = createG();
        let alignLines = [];

        let deltaWidth = 0;
        let deltaHeight = 0;
        let isCorrectWidth = false;
        let isCorrectHeight = false;
        let drawActiveHorizontal = false;
        let drawActiveVertical = false;
        const { resizeDirectionFactors } = resizeAlignOptions;

        for (let alignRectangle of alignRectangles) {
            const offsetWidth = alignRectangle.width - this.activeRectangle.width;
            const offsetHeight = alignRectangle.height - this.activeRectangle.height;

            let canDrawHorizontal = false;
            if (resizeDirectionFactors[0] !== 0) {
                if (!isCorrectWidth && Math.abs(offsetWidth) < ALIGN_TOLERANCE) {
                    this.activeRectangle.width += offsetWidth;
                    deltaWidth = offsetWidth * resizeDirectionFactors[0];
                    if (resizeDirectionFactors[0] === -1) {
                        this.activeRectangle.x += deltaWidth;
                    }
                    isCorrectWidth = true;
                    canDrawHorizontal = true;
                }

                if (offsetWidth === 0) {
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
            if (resizeDirectionFactors[1] !== 0) {
                if (!isCorrectHeight && Math.abs(offsetHeight) < ALIGN_TOLERANCE) {
                    this.activeRectangle.height += offsetHeight;
                    deltaHeight = offsetHeight * resizeDirectionFactors[1];
                    if (resizeDirectionFactors[1] === -1) {
                        this.activeRectangle.y += deltaHeight;
                    }
                    canDrawVertical = true;
                    isCorrectHeight = true;
                }

                if (offsetHeight === 0) {
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
