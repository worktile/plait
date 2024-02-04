import { PlaitBoard, PlaitElement, Point, RectangleClient, SELECTION_BORDER_COLOR, createG, findElements } from '@plait/core';

export interface ResizeAlignRef {
    deltaWidth: number;
    deltaHeight: number;
    g: SVGGElement;
}

export interface ResizeAlignOptions {
    directionFactors: [number, number];
    isMaintainAspectRatio: boolean;
}

export interface ResizeAlignDeltaAndRectangle {
    deltaWidth: number;
    deltaHeight: number;
    widthAlignRectangle?: RectangleClient;
    heightAlignRectangle?: RectangleClient;
}

const ALIGN_TOLERANCE = 2;

const EQUAL_SPACING = 10;

export class ResizeAlignReaction {
    alignRectangles: RectangleClient[];

    resizeAlignOptions!: ResizeAlignOptions;

    constructor(private board: PlaitBoard, private activeElements: PlaitElement[], private activeRectangle: RectangleClient) {
        this.alignRectangles = this.getAlignRectangle();
    }

    getAlignRectangle() {
        const elements = findElements(this.board, {
            match: element => this.board.isAlign(element) && !this.activeElements.some(item => item.id === element.id),
            recursion: () => false,
            isReverse: false
        });
        return elements.map(item => this.board.getRectangle(item)!);
    }

    getDeltaAndAlignRectangle(): ResizeAlignDeltaAndRectangle | null {
        const widthAlignRectangle = this.alignRectangles.find(item => Math.abs(item.width - this.activeRectangle.width) < ALIGN_TOLERANCE);
        const heightAlignRectangle = this.alignRectangles.find(
            item => Math.abs(item.height - this.activeRectangle.height) < ALIGN_TOLERANCE
        );
        let result: ResizeAlignDeltaAndRectangle = {
            deltaWidth: 0,
            deltaHeight: 0
        };
        if (widthAlignRectangle) {
            const offsetWidth = widthAlignRectangle.width - this.activeRectangle.width;
            result.deltaWidth = offsetWidth * this.resizeAlignOptions.directionFactors[0];
            result.widthAlignRectangle = widthAlignRectangle;
        }
        if (heightAlignRectangle) {
            const offsetHeight = heightAlignRectangle.height - this.activeRectangle.height;
            result.deltaHeight = offsetHeight * this.resizeAlignOptions.directionFactors[1];
            result.heightAlignRectangle = heightAlignRectangle;
        }
        return result;
    }

    updateActiveRectangle(result: ResizeAlignDeltaAndRectangle) {
        if (result?.widthAlignRectangle) {
            if (this.resizeAlignOptions.directionFactors[0] === -1) {
                this.activeRectangle.x += result.deltaWidth;
                this.activeRectangle.width += result.deltaWidth * this.resizeAlignOptions.directionFactors[0];
            } else {
                this.activeRectangle.width += result.deltaWidth;
            }
        }
        if (result?.heightAlignRectangle) {
            if (this.resizeAlignOptions.directionFactors[1] === -1) {
                this.activeRectangle.y += result.deltaHeight;
                this.activeRectangle.height += result.deltaHeight * this.resizeAlignOptions.directionFactors[1];
            } else {
                this.activeRectangle.height += result.deltaHeight;
            }
        }
    }

    getEqualAlignLines() {
        let widthAlignPoints = [];
        let heightAlignPoints = [];
        for (let alignRectangle of this.alignRectangles) {
            if (this.activeRectangle.width === alignRectangle.width) {
                widthAlignPoints.push(getEqualLinePoints(alignRectangle, true));
            }
            if (this.activeRectangle.height === alignRectangle.height) {
                heightAlignPoints.push(getEqualLinePoints(alignRectangle, false));
            }
        }
        if (widthAlignPoints.length) {
            widthAlignPoints.push(getEqualLinePoints(this.activeRectangle, true));
        }
        if (heightAlignPoints.length) {
            heightAlignPoints.push(getEqualLinePoints(this.activeRectangle, false));
        }
        const alignLines = [...widthAlignPoints, ...heightAlignPoints];
        if (alignLines.length) {
            return this.drawEqualLines(alignLines);
        }
        return null;
    }

    drawEqualLines(lines: Point[][]) {
        const g = createG();
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
        return g;
    }

    handleResizeAlign(resizeAlignOptions: ResizeAlignOptions): ResizeAlignRef {
        let g = createG();
        let deltaWidth = 0;
        let deltaHeight = 0;

        this.resizeAlignOptions = resizeAlignOptions;
        const result = this.getDeltaAndAlignRectangle();
        if (result?.widthAlignRectangle || result?.heightAlignRectangle) {
            deltaWidth = result.deltaWidth;
            deltaHeight = result.deltaHeight;
            this.updateActiveRectangle(result);
            const equalAlignLines = this.getEqualAlignLines();
            if (equalAlignLines) {
                g = equalAlignLines;
            }
        }

        return { deltaWidth, deltaHeight, g };
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
