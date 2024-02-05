import { ResizeState, getUnitVectorByPointAndPoint } from '@plait/common';
import { PlaitBoard, PlaitElement, Point, RectangleClient, SELECTION_BORDER_COLOR, createG, findElements } from '@plait/core';
import { getResizeZoom, movePointByZoomAndOriginPoint } from '../plugins/with-draw-resize';

export interface EqualLineDelta {
    deltaX: number;
    deltaY: number;
}

export interface EqualLineRef extends EqualLineDelta {
    xZoom: number;
    yZoom: number;
    points: Point[];
}

export interface ResizeAlignRef extends EqualLineRef {
    equalLinesG: SVGGElement;
}

export interface ResizeAlignOptions {
    resizeState: ResizeState;
    resizePoints: Point[];
    directionFactors: [number, number];
    originPoint: Point;
    handlePoint: Point;
    isFromCorner: boolean;
    isAspectRatio: boolean;
}

const ALIGN_TOLERANCE = 2;

const EQUAL_SPACING = 10;

export class ResizeAlignReaction {
    alignRectangles: RectangleClient[];

    resizeAlignOptions!: ResizeAlignOptions;

    constructor(private board: PlaitBoard, private activeElements: PlaitElement[], private activeRectangle: RectangleClient) {
        this.alignRectangles = this.getAlignRectangle();
    }

    get drawHorizontalLine() {
        return this.resizeAlignOptions.directionFactors[0] !== 0 || this.resizeAlignOptions.isAspectRatio;
    }

    get drawVerticalLine() {
        return this.resizeAlignOptions.directionFactors[1] !== 0 || this.resizeAlignOptions.isAspectRatio;
    }

    getAlignRectangle() {
        const elements = findElements(this.board, {
            match: element => this.board.isAlign(element) && !this.activeElements.some(item => item.id === element.id),
            recursion: () => false,
            isReverse: false
        });
        return elements.map(item => this.board.getRectangle(item)!);
    }

    getEqualLineDelta() {
        let equalLineDelta: EqualLineDelta = {
            deltaX: 0,
            deltaY: 0
        };
        const { isAspectRatio, isFromCorner, originPoint, handlePoint } = this.resizeAlignOptions;
        const widthAlignRectangle = this.alignRectangles.find(item => Math.abs(item.width - this.activeRectangle.width) < ALIGN_TOLERANCE);
        if (widthAlignRectangle) {
            const deltaWidth = widthAlignRectangle.width - this.activeRectangle.width;
            equalLineDelta.deltaX = deltaWidth * this.resizeAlignOptions.directionFactors[0];
            if (isAspectRatio) {
                if (isFromCorner) {
                    const unitVector = getUnitVectorByPointAndPoint(originPoint, handlePoint);
                    equalLineDelta.deltaY = equalLineDelta.deltaX / (unitVector[0] / unitVector[1]);
                } else {
                    equalLineDelta.deltaY = equalLineDelta.deltaX / (this.activeRectangle.width / this.activeRectangle.height);
                }
                return equalLineDelta;
            }
        }

        const heightAlignRectangle = this.alignRectangles.find(
            item => Math.abs(item.height - this.activeRectangle.height) < ALIGN_TOLERANCE
        );
        if (heightAlignRectangle) {
            const deltaHeight = heightAlignRectangle.height - this.activeRectangle.height;
            equalLineDelta.deltaY = deltaHeight * this.resizeAlignOptions.directionFactors[1];
            if (isAspectRatio) {
                if (isFromCorner) {
                    const unitVector = getUnitVectorByPointAndPoint(originPoint, handlePoint);
                    equalLineDelta.deltaX = equalLineDelta.deltaY * (unitVector[0] / unitVector[1]);
                } else {
                    equalLineDelta.deltaX = equalLineDelta.deltaX * (this.activeRectangle.width / this.activeRectangle.height);
                }
                return equalLineDelta;
            }
        }

        return equalLineDelta;
    }

    getEqualLineRef(): EqualLineRef {
        const { deltaX, deltaY } = this.getEqualLineDelta();
        const { resizeState, originPoint, handlePoint, isFromCorner, isAspectRatio, resizePoints } = this.resizeAlignOptions;
        const newResizeState: ResizeState = {
            ...resizeState,
            endPoint: [resizeState.endPoint[0] + deltaX, resizeState.endPoint[1] + deltaY]
        };
        const { xZoom, yZoom } = getResizeZoom(newResizeState, originPoint, handlePoint, isFromCorner, isAspectRatio);
        const points = resizePoints.map(p => {
            return movePointByZoomAndOriginPoint(p, originPoint, xZoom, yZoom);
        }) as [Point, Point];

        return {
            deltaX,
            deltaY,
            xZoom,
            yZoom,
            points
        };
    }

    updateActiveRectangle(points: Point[]) {
        this.activeRectangle = RectangleClient.getRectangleByPoints(points);
    }

    drawEqualLines() {
        let widthEqualPoints = [];
        let heightEqualPoints = [];

        for (let alignRectangle of this.alignRectangles) {
            if (this.activeRectangle.width === alignRectangle.width && this.drawHorizontalLine) {
                widthEqualPoints.push(getEqualLinePoints(alignRectangle, true));
            }
            if (this.activeRectangle.height === alignRectangle.height && this.drawVerticalLine) {
                heightEqualPoints.push(getEqualLinePoints(alignRectangle, false));
            }
        }
        if (widthEqualPoints.length && this.drawHorizontalLine) {
            widthEqualPoints.push(getEqualLinePoints(this.activeRectangle, true));
        }
        if (heightEqualPoints.length && this.drawVerticalLine) {
            heightEqualPoints.push(getEqualLinePoints(this.activeRectangle, false));
        }

        const equalLinePoints = [...widthEqualPoints, ...heightEqualPoints];
        return drawEqualLines(this.board, equalLinePoints);
    }

    handleResizeAlign(resizeAlignOptions: ResizeAlignOptions): ResizeAlignRef {
        this.resizeAlignOptions = resizeAlignOptions;

        const equalLineRef = this.getEqualLineRef();
        const deltaX = equalLineRef.deltaX || 0; // equal || align || 0
        const deltaY = equalLineRef.deltaY || 0;
        if (deltaX !== 0 || deltaY !== 0) {
            this.updateActiveRectangle(equalLineRef.points);
        }
        const equalLinesG = this.drawEqualLines();
        return { ...equalLineRef, equalLinesG };
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
