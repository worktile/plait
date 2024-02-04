import { PlaitBoard, PlaitElement, Point, RectangleClient, SELECTION_BORDER_COLOR, createG, findElements } from '@plait/core';

export interface ResizeAlignRef {
    deltaWidth: number;
    deltaHeight: number;
    equalLinesG: SVGGElement;
}

export interface ResizeAlignOptions {
    directionFactors: [number, number];
    isMaintainAspectRatio: boolean;
}

export interface EqualLineRef {
    deltaWidth: number;
    deltaHeight: number;
}

const ALIGN_TOLERANCE = 2;

const EQUAL_SPACING = 10;

export class ResizeAlignReaction {
    alignRectangles: RectangleClient[];

    resizeAlignOptions!: ResizeAlignOptions;

    constructor(private board: PlaitBoard, private activeElements: PlaitElement[], private activeRectangle: RectangleClient) {
        this.alignRectangles = this.getAlignRectangle();
    }

    get isHorizontalResize() {
        return this.resizeAlignOptions.directionFactors[0] !== 0;
    }

    get isVerticalResize() {
        return this.resizeAlignOptions.directionFactors[1] !== 0;
    }

    getAlignRectangle() {
        const elements = findElements(this.board, {
            match: element => this.board.isAlign(element) && !this.activeElements.some(item => item.id === element.id),
            recursion: () => false,
            isReverse: false
        });
        return elements.map(item => this.board.getRectangle(item)!);
    }

    getEqualLineRef(): EqualLineRef {
        let equalLineRef: EqualLineRef = {
            deltaWidth: 0,
            deltaHeight: 0
        };

        if (this.isHorizontalResize) {
            const widthAlignRectangle = this.alignRectangles.find(
                item => Math.abs(item.width - this.activeRectangle.width) < ALIGN_TOLERANCE
            );
            if (widthAlignRectangle) {
                const offsetWidth = widthAlignRectangle.width - this.activeRectangle.width;
                equalLineRef.deltaWidth = offsetWidth * this.resizeAlignOptions.directionFactors[0];
            }
        }

        if (this.isVerticalResize) {
            const heightAlignRectangle = this.alignRectangles.find(
                item => Math.abs(item.height - this.activeRectangle.height) < ALIGN_TOLERANCE
            );
            if (heightAlignRectangle) {
                const offsetHeight = heightAlignRectangle.height - this.activeRectangle.height;
                equalLineRef.deltaHeight = offsetHeight * this.resizeAlignOptions.directionFactors[1];
            }
        }

        return equalLineRef;
    }

    updateActiveRectangle(equalLineRef: EqualLineRef) {
        const isAdjustRectangleWidth = equalLineRef.deltaWidth !== 0;
        const isAdjustRectangleHeight = equalLineRef.deltaHeight !== 0;
        if (isAdjustRectangleWidth) {
            if (this.resizeAlignOptions.directionFactors[0] === -1) {
                this.activeRectangle.x += equalLineRef.deltaWidth;
            }
            this.activeRectangle.width += equalLineRef.deltaWidth * this.resizeAlignOptions.directionFactors[0];
        }
        if (isAdjustRectangleHeight) {
            if (this.resizeAlignOptions.directionFactors[1] === -1) {
                this.activeRectangle.y += equalLineRef.deltaHeight;
            }
            this.activeRectangle.height += equalLineRef.deltaHeight * this.resizeAlignOptions.directionFactors[1];
        }
    }

    drawEqualLines() {
        let widthEqualPoints = [];
        let heightEqualPoints = [];

        for (let alignRectangle of this.alignRectangles) {
            if (this.activeRectangle.width === alignRectangle.width && this.isHorizontalResize) {
                widthEqualPoints.push(getEqualLinePoints(alignRectangle, true));
            }
            if (this.activeRectangle.height === alignRectangle.height && this.isVerticalResize) {
                heightEqualPoints.push(getEqualLinePoints(alignRectangle, false));
            }
        }
        if (widthEqualPoints.length && this.isHorizontalResize) {
            widthEqualPoints.push(getEqualLinePoints(this.activeRectangle, true));
        }
        if (heightEqualPoints.length && this.isVerticalResize) {
            heightEqualPoints.push(getEqualLinePoints(this.activeRectangle, false));
        }

        const equalLinePoints = [...widthEqualPoints, ...heightEqualPoints];
        return drawEqualLines(this.board, equalLinePoints);
    }

    handleResizeAlign(resizeAlignOptions: ResizeAlignOptions): ResizeAlignRef {
        this.resizeAlignOptions = resizeAlignOptions;

        const equalLineRef = this.getEqualLineRef();
        this.updateActiveRectangle(equalLineRef);
        const equalLinesG = this.drawEqualLines();
        const deltaWidth = equalLineRef.deltaWidth;
        const deltaHeight = equalLineRef.deltaHeight;

        return { deltaWidth, deltaHeight, equalLinesG };
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

function drawEqualLines(board: PlaitBoard, lines: Point[][]) {
    const g = createG();
    lines.forEach(line => {
        if (!line.length) return;
        const yAlign = PlaitBoard.getRoughSVG(board).line(line[0][0], line[0][1], line[1][0], line[1][1], {
            stroke: SELECTION_BORDER_COLOR,
            strokeWidth: 1
        });
        g.appendChild(yAlign);
        line.forEach(point => {
            const barPoint = getBarPoint(point, !!Point.isHorizontal(line[0], line[1]));
            const bar = PlaitBoard.getRoughSVG(board).line(barPoint[0][0], barPoint[0][1], barPoint[1][0], barPoint[1][1], {
                stroke: SELECTION_BORDER_COLOR,
                strokeWidth: 1
            });
            g.appendChild(bar);
        });
    });
    return g;
}
