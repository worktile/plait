import { PlaitBoard } from '../interfaces/board';
import { createG } from './dom/common';
import { PlaitElement } from '../interfaces/element';
import { Ancestor } from '../interfaces/node';
import { Point, RectangleClient, SELECTION_BORDER_COLOR } from '../interfaces';
import { depthFirstRecursion } from './tree';

export interface ResizeAlignRef {
    deltaWidth: number;
    deltaHeight: number;
    g: SVGGElement;
}

export interface ResizeDistributeRef {
    before: { distance: number; index: number }[];
    after: { distance: number; index: number }[];
}

const ALIGN_TOLERANCE = 2;

const EQUAL_SPACING = 10;

export const enum ResizeAlignDirection {
    x = 'x',
    y = 'y'
}

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

    handleAlign(direction?: ResizeAlignDirection | null): ResizeAlignRef {
        const alignRectangles = this.getAlignRectangle();
        const g = createG();
        let alignLines = [];

        let deltaWidth = 0;
        let deltaHeight = 0;
        let isCorrectWidth = false;
        let isCorrectHeight = false;

        for (let alignRectangle of alignRectangles) {
            const offsetWidth = this.activeRectangle.width - alignRectangle.width;
            const offsetHeight = this.activeRectangle.height - alignRectangle.height;
            const absOffsetWidth = Math.abs(offsetWidth);
            const absOffsetHeight = Math.abs(offsetHeight);

            let canDrawHorizontal = false;
            if (!isCorrectWidth && absOffsetWidth < ALIGN_TOLERANCE) {
                deltaWidth = offsetWidth;
                this.activeRectangle.width -= deltaWidth;
                isCorrectWidth = true;
                canDrawHorizontal = true;
            }

            if (absOffsetWidth === 0) {
                canDrawHorizontal = true;
            }

            if (direction && direction === ResizeAlignDirection.y) {
                canDrawHorizontal = false;
            }

            if (canDrawHorizontal) {
                const linePoints: Point[] = [
                    [alignRectangle.x, alignRectangle.y - EQUAL_SPACING],
                    [alignRectangle.x + alignRectangle.width, alignRectangle.y - EQUAL_SPACING]
                ];
                alignLines.push(linePoints);
            }

            let canDrawVertical = false;
            if (!isCorrectHeight && absOffsetHeight < ALIGN_TOLERANCE) {
                deltaHeight = offsetHeight;
                this.activeRectangle.height -= deltaHeight;
                canDrawVertical = true;
                isCorrectHeight = true;
            }

            if (absOffsetHeight === 0) {
                canDrawVertical = true;
            }

            if (direction && direction === ResizeAlignDirection.x) {
                canDrawVertical = false;
            }

            if (canDrawVertical) {
                const linePoints: Point[] = [
                    [alignRectangle.x - EQUAL_SPACING, alignRectangle.y],
                    [alignRectangle.x - EQUAL_SPACING, alignRectangle.y + alignRectangle.height]
                ];
                alignLines.push(linePoints);
            }
        }

        this.activeRectangle.width += deltaWidth;
        this.activeRectangle.height += deltaHeight;
        if (alignLines.length) {
            this.drawEqualLines(alignLines, g);
        }
        return { deltaWidth, deltaHeight, g };
    }

    drawEqualLines(lines: Point[][], g: SVGGElement) {
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
