import { ResizeState } from '@plait/common';
import {
    Direction,
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
    alignG: SVGGElement;
}

export interface ResizeAlignDistance {
    absDistance: number;
    distance: number;
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

export type TripleAlignAxis = [number, number, number];

const ALIGN_TOLERANCE = 2;

const EQUAL_SPACING = 10;

const ALIGN_SPACING = 12;

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

    getAlignLineRef(resizeAlignDelta: ResizeAlignDelta, resizeAlignOptions: ResizeAlignOptions): EqualLineRef {
        const { deltaX, deltaY } = resizeAlignDelta;
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
                equalLineDelta.deltaY = equalLineDelta.deltaX / (activeRectangle.width / activeRectangle.height);
                return equalLineDelta;
            }
        }

        const heightAlignRectangle = this.alignRectangles.find(item => Math.abs(item.height - activeRectangle.height) < ALIGN_TOLERANCE);
        if (heightAlignRectangle) {
            const deltaHeight = heightAlignRectangle.height - activeRectangle.height;
            equalLineDelta.deltaY = deltaHeight * resizeAlignOptions.directionFactors[1];
            if (isAspectRatio) {
                equalLineDelta.deltaX = equalLineDelta.deltaY * (activeRectangle.width / activeRectangle.height);
                return equalLineDelta;
            }
        }

        return equalLineDelta;
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

    getAlignLineDelta(resizeAlignOptions: ResizeAlignOptions) {
        let alignLineDelta: ResizeAlignDelta = {
            deltaX: 0,
            deltaY: 0
        };
        const { isAspectRatio, activeRectangle, directionFactors } = resizeAlignOptions;

        const xAlignAxis = getTripleAlignAxis(activeRectangle, true);
        const alignX = directionFactors[0] === -1 ? xAlignAxis[0] : xAlignAxis[2];
        const yAlignAxis = getTripleAlignAxis(activeRectangle, false);
        const alignY = directionFactors[1] === -1 ? yAlignAxis[0] : yAlignAxis[2];

        const closestAlignRectangle = this.alignRectangles.find(item => {
            const xDistances = getClosestDistances(alignX, item, true);
            const yDistances = getClosestDistances(alignY, item, false);
            return Math.min(xDistances.absDistance, yDistances.absDistance) < ALIGN_TOLERANCE;
        });
        if (closestAlignRectangle) {
            const xDistances = getClosestDistances(alignX, closestAlignRectangle, true);
            if (xDistances.absDistance < ALIGN_TOLERANCE) {
                alignLineDelta.deltaX = xDistances.distance;
                if (alignLineDelta.deltaX !== 0 && isAspectRatio) {
                    alignLineDelta.deltaY = alignLineDelta.deltaX / (activeRectangle.width / activeRectangle.height);
                    return alignLineDelta;
                }
            }

            const yDistances = getClosestDistances(alignY, closestAlignRectangle, false);
            if (yDistances.absDistance < ALIGN_TOLERANCE) {
                alignLineDelta.deltaY = yDistances.distance;
                if (alignLineDelta.deltaY !== 0 && isAspectRatio) {
                    alignLineDelta.deltaX = alignLineDelta.deltaY * (activeRectangle.width / activeRectangle.height);
                    return alignLineDelta;
                }
            }
        }
        return alignLineDelta;
    }

    drawAlignLines(activePoints: Point[]) {
        const activeRectangle = RectangleClient.getRectangleByPoints(activePoints);
        let alignLinePoints: number[][] = [];

        const alignLeftRectangle = this.alignRectangles.find(item => {
            return isAlign(activeRectangle.x, item, true);
        });
        if (alignLeftRectangle) {
            const [min, max] = getMinAndMaxAlignAxis(activeRectangle, alignLeftRectangle, true);
            const leftLine: number[] = [activeRectangle.x, min, activeRectangle.x, max];
            alignLinePoints.push(leftLine);
        }

        const alignRightRectangle = this.alignRectangles.find(item => {
            return isAlign(activeRectangle.x + activeRectangle.width, item, true);
        });
        if (alignRightRectangle) {
            const [min, max] = getMinAndMaxAlignAxis(activeRectangle, alignRightRectangle, true);
            const rightLine: number[] = [activeRectangle.x + activeRectangle.width, min, activeRectangle.x + activeRectangle.width, max];
            alignLinePoints.push(rightLine);
        }

        const alignTopRectangle = this.alignRectangles.find(item => {
            return isAlign(activeRectangle.y, item, false);
        });

        if (alignTopRectangle) {
            const [min, max] = getMinAndMaxAlignAxis(activeRectangle, alignTopRectangle, false);
            const topLine = [min, activeRectangle.y, max, activeRectangle.y];
            alignLinePoints.push(topLine);
        }

        const alignBottomRectangle = this.alignRectangles.find(item => {
            return isAlign(activeRectangle.y + activeRectangle.height, item, false);
        });

        if (alignBottomRectangle) {
            const [min, max] = getMinAndMaxAlignAxis(activeRectangle, alignBottomRectangle, false);
            const topLine: number[] = [min, activeRectangle.y + activeRectangle.height, max, activeRectangle.y + activeRectangle.height];
            alignLinePoints.push(topLine);
        }

        return drawAlignLines(this.board, alignLinePoints);
    }

    handleResizeAlign(resizeAlignOptions: ResizeAlignOptions): ResizeAlignRef {
        const alignG = createG();
        let alignLineDelta = this.getEqualLineDelta(resizeAlignOptions);
        if (alignLineDelta.deltaX === 0 && alignLineDelta.deltaY === 0) {
            alignLineDelta = this.getAlignLineDelta(resizeAlignOptions);
        }
        const equalLineRef = this.getAlignLineRef(alignLineDelta, resizeAlignOptions);
        const equalLinesG = this.drawEqualLines(equalLineRef.activePoints, resizeAlignOptions);
        const alignLinesG = this.drawAlignLines(equalLineRef.activePoints);
        alignG.append(equalLinesG, alignLinesG);
        return { ...equalLineRef, alignG };
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

function drawAlignLines(board: PlaitBoard, lines: number[][]) {
    const g = createG();
    lines.forEach(points => {
        if (!points.length) return;
        const xAlign = PlaitBoard.getRoughSVG(board).line(points[0], points[1], points[2], points[3], {
            stroke: SELECTION_BORDER_COLOR,
            strokeWidth: 1,
            strokeLineDash: [4, 4]
        });
        g.appendChild(xAlign);
    });
    return g;
}

export const getTripleAlignAxis = (rectangle: RectangleClient, isHorizontal: boolean): TripleAlignAxis => {
    const axis = isHorizontal ? 'x' : 'y';
    const side = isHorizontal ? 'width' : 'height';
    return [rectangle[axis], rectangle[axis] + rectangle[side] / 2, rectangle[axis] + rectangle[side]];
};

export const isAlign = (axis: number, rectangle: RectangleClient, isHorizontal: boolean) => {
    const alignAxis = getTripleAlignAxis(rectangle, isHorizontal);
    return alignAxis.includes(axis);
};

export const getClosestDistances = (axis: number, rectangle: RectangleClient, isHorizontal: boolean) => {
    const alignAxis = getTripleAlignAxis(rectangle, isHorizontal);
    const distances = alignAxis.map(item => item - axis);
    const distancesAbs = distances.map(item => Math.abs(item));
    const index = distancesAbs.indexOf(Math.min(...distancesAbs));

    return {
        absDistance: distancesAbs[index],
        distance: distances[index]
    };
};

export const getMinAndMaxAlignAxis = (activeRectangle: RectangleClient, alignRectangle: RectangleClient, isHorizontal: boolean) => {
    const axis = isHorizontal ? 'y' : 'x';
    const side = isHorizontal ? 'height' : 'width';
    const axisData = [
        alignRectangle[axis],
        alignRectangle[axis] + alignRectangle[side],
        activeRectangle[axis],
        activeRectangle[axis] + activeRectangle[side]
    ];
    return [Math.min(...axisData) - ALIGN_SPACING, Math.max(...axisData) + ALIGN_SPACING];
};
