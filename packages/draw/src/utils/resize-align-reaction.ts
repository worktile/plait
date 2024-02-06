import { ResizeState } from '@plait/common';
import {
    DirectionFactors,
    PlaitBoard,
    PlaitElement,
    Point,
    RectangleClient,
    SELECTION_BORDER_COLOR,
    createG,
    findElements
} from '@plait/core';
import { getResizeZoom, movePointByZoomAndOriginPoint } from '../plugins/with-draw-resize';

export interface ResizeAlignDelta {
    deltaX: number;
    deltaY: number;
}

export interface EqualLineRef extends ResizeAlignDelta {
    xZoom: number;
    yZoom: number;
    activePoints: Point[];
}

export interface ResizeAlignRef extends EqualLineRef {
    equalLinesG: SVGGElement;
}

export interface ResizeAlignOptions {
    resizeState: ResizeState;
    resizeOriginPoints: Point[];
    activeRectangle: RectangleClient;
    directionFactors: DirectionFactors;
    originPoint: Point;
    handlePoint: Point;
    isFromCorner: boolean;
    isAspectRatio: boolean;
}

const ALIGN_TOLERANCE = 5;

const EQUAL_SPACING = 10;

export class ResizeAlignReaction {
    alignRectangles: RectangleClient[];

    constructor(private board: PlaitBoard, private activeElements: PlaitElement[]) {
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

    getEqualLineDelta(resizeAlignOptions: ResizeAlignOptions) {
        let equalLineDelta: ResizeAlignDelta = {
            deltaX: 0,
            deltaY: 0
        };
        const { isAspectRatio, activeRectangle } = resizeAlignOptions;
        const widthAlignRectangle = this.alignRectangles.find(item => Math.abs(item.width - activeRectangle.width) < ALIGN_TOLERANCE);
        if (widthAlignRectangle) {
            const deltaWidth = widthAlignRectangle.width - activeRectangle.width;
            equalLineDelta.deltaX = deltaWidth * resizeAlignOptions.directionFactors[0];
            if (isAspectRatio) {
                const deltaHeight = deltaWidth / (activeRectangle.width / activeRectangle.height);
                equalLineDelta.deltaY = deltaHeight * resizeAlignOptions.directionFactors[1];
                return equalLineDelta;
            }
        }
        const heightAlignRectangle = this.alignRectangles.find(item => Math.abs(item.height - activeRectangle.height) < ALIGN_TOLERANCE);
        if (heightAlignRectangle) {
            const deltaHeight = heightAlignRectangle.height - activeRectangle.height;
            equalLineDelta.deltaY = deltaHeight * resizeAlignOptions.directionFactors[1];
            if (isAspectRatio) {
                const deltaWidth = deltaHeight * (activeRectangle.width / activeRectangle.height);
                equalLineDelta.deltaX = deltaWidth * resizeAlignOptions.directionFactors[0];
                return equalLineDelta;
            }
        }
        return equalLineDelta;
    }

    getEqualLineRef(resizeAlignOptions: ResizeAlignOptions): EqualLineRef {
        const { deltaX, deltaY } = this.getEqualLineDelta(resizeAlignOptions);
        const { resizeState, originPoint, handlePoint, isFromCorner, isAspectRatio, resizeOriginPoints } = resizeAlignOptions;
        const newResizeState: ResizeState = {
            ...resizeState,
            endPoint: [resizeState.endPoint[0] + deltaX, resizeState.endPoint[1] + deltaY]
        };
        const { xZoom, yZoom } = getResizeZoom(newResizeState, originPoint, handlePoint, isFromCorner, isAspectRatio);
        const activePoints = resizeOriginPoints.map(p => {
            return movePointByZoomAndOriginPoint(p, originPoint, xZoom, yZoom);
        }) as [Point, Point];

        return {
            deltaX,
            deltaY,
            xZoom,
            yZoom,
            activePoints
        };
    }

    drawEqualLines(activePoints: Point[], resizeAlignOptions: ResizeAlignOptions) {
        let widthEqualPoints = [];
        let heightEqualPoints = [];

        const drawHorizontalLine = resizeAlignOptions.directionFactors[0] !== 0 || resizeAlignOptions.isAspectRatio;
        const drawVerticalLine = resizeAlignOptions.directionFactors[1] !== 0 || resizeAlignOptions.isAspectRatio;

        const activeRectangle = RectangleClient.getRectangleByPoints(activePoints);
        for (let alignRectangle of this.alignRectangles) {
            if (activeRectangle.width === alignRectangle.width && drawHorizontalLine) {
                widthEqualPoints.push(getEqualLinePoints(alignRectangle, true));
            }
            if (activeRectangle.height === alignRectangle.height && drawVerticalLine) {
                heightEqualPoints.push(getEqualLinePoints(alignRectangle, false));
            }
        }
        if (widthEqualPoints.length && drawHorizontalLine) {
            widthEqualPoints.push(getEqualLinePoints(activeRectangle, true));
        }
        if (heightEqualPoints.length && drawVerticalLine) {
            heightEqualPoints.push(getEqualLinePoints(activeRectangle, false));
        }

        const equalLinePoints = [...widthEqualPoints, ...heightEqualPoints];
        return drawEqualLines(this.board, equalLinePoints);
    }

    handleResizeAlign(resizeAlignOptions: ResizeAlignOptions): ResizeAlignRef {
        const equalLineRef = this.getEqualLineRef(resizeAlignOptions);
        const equalLinesG = this.drawEqualLines(equalLineRef.activePoints, resizeAlignOptions);
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
