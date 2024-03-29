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

export interface AlignLineRef extends ResizeAlignDelta {
    xZoom: number;
    yZoom: number;
    activePoints: Point[];
}

export interface ResizeAlignRef extends AlignLineRef {
    alignG: SVGGElement;
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

type TripleAlignAxis = [number, number, number];

type DrawAlignLineRef = {
    axis: number;
    isHorizontal: boolean;
    alignRectangles: RectangleClient[];
};

const ALIGN_TOLERANCE = 2;

const EQUAL_SPACING = 10;

const ALIGN_SPACING = 24;

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

    getAlignLineRef(resizeAlignDelta: ResizeAlignDelta, resizeAlignOptions: ResizeAlignOptions): AlignLineRef {
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
        const drawHorizontal = directionFactors[0] !== 0 || isAspectRatio;
        const drawVertical = directionFactors[1] !== 0 || isAspectRatio;

        if (drawHorizontal) {
            const xAlignAxis = getTripleAlignAxis(activeRectangle, true);
            const alignX = directionFactors[0] === -1 ? xAlignAxis[0] : xAlignAxis[2];
            const deltaX = getMinAlignDelta(this.alignRectangles, alignX, true);
            if (Math.abs(deltaX) < ALIGN_TOLERANCE) {
                alignLineDelta.deltaX = deltaX;
                if (alignLineDelta.deltaX !== 0 && isAspectRatio) {
                    alignLineDelta.deltaY = alignLineDelta.deltaX / (activeRectangle.width / activeRectangle.height);
                    return alignLineDelta;
                }
            }
        }

        if (drawVertical) {
            const yAlignAxis = getTripleAlignAxis(activeRectangle, false);
            const alignY = directionFactors[1] === -1 ? yAlignAxis[0] : yAlignAxis[2];
            const deltaY = getMinAlignDelta(this.alignRectangles, alignY, false);
            if (Math.abs(deltaY) < ALIGN_TOLERANCE) {
                alignLineDelta.deltaY = deltaY;
                if (alignLineDelta.deltaY !== 0 && isAspectRatio) {
                    alignLineDelta.deltaX = alignLineDelta.deltaY * (activeRectangle.width / activeRectangle.height);
                    return alignLineDelta;
                }
            }
        }

        return alignLineDelta;
    }

    drawAlignLines(activePoints: Point[], resizeAlignOptions: ResizeAlignOptions) {
        let alignLinePoints: [Point, Point][] = [];
        const activeRectangle = RectangleClient.getRectangleByPoints(activePoints);
        const alignAxisX = getTripleAlignAxis(activeRectangle, true);
        const alignAxisY = getTripleAlignAxis(activeRectangle, false);
        const alignLineRefs: DrawAlignLineRef[] = [
            {
                axis: alignAxisX[0],
                isHorizontal: true,
                alignRectangles: []
            },
            {
                axis: alignAxisX[2],
                isHorizontal: true,
                alignRectangles: []
            },
            {
                axis: alignAxisY[0],
                isHorizontal: false,
                alignRectangles: []
            },
            {
                axis: alignAxisY[2],
                isHorizontal: false,
                alignRectangles: []
            }
        ];
        const setAlignLine = (axis: number, alignRectangle: RectangleClient, isHorizontal: boolean) => {
            const boundingRectangle = RectangleClient.inflate(
                RectangleClient.getBoundingRectangle([activeRectangle, alignRectangle]),
                ALIGN_SPACING
            );
            if (isHorizontal) {
                const pointStart = [axis, boundingRectangle.y] as Point;
                const pointEnd = [axis, boundingRectangle.y + boundingRectangle.height] as Point;
                alignLinePoints.push([pointStart, pointEnd]);
            } else {
                const pointStart = [boundingRectangle.x, axis] as Point;
                const pointEnd = [boundingRectangle.x + boundingRectangle.width, axis] as Point;
                alignLinePoints.push([pointStart, pointEnd]);
            }
        };

        const { isAspectRatio, directionFactors } = resizeAlignOptions;
        const drawHorizontal = directionFactors[0] !== 0 || isAspectRatio;
        const drawVertical = directionFactors[1] !== 0 || isAspectRatio;

        for (let index = 0; index < this.alignRectangles.length; index++) {
            const element = this.alignRectangles[index];
            if (isAlign(alignLineRefs[0].axis, element, alignLineRefs[0].isHorizontal)) {
                alignLineRefs[0].alignRectangles.push(element);
            }
            if (isAlign(alignLineRefs[1].axis, element, alignLineRefs[1].isHorizontal)) {
                alignLineRefs[1].alignRectangles.push(element);
            }
            if (isAlign(alignLineRefs[2].axis, element, alignLineRefs[2].isHorizontal)) {
                alignLineRefs[2].alignRectangles.push(element);
            }
            if (isAlign(alignLineRefs[3].axis, element, alignLineRefs[3].isHorizontal)) {
                alignLineRefs[3].alignRectangles.push(element);
            }
        }

        if (drawHorizontal && alignLineRefs[0].alignRectangles.length) {
            const leftRectangle =
                alignLineRefs[0].alignRectangles.length === 1
                    ? alignLineRefs[0].alignRectangles[0]
                    : getNearestAlignRectangle(alignLineRefs[0].alignRectangles, activeRectangle);
            setAlignLine(alignLineRefs[0].axis, leftRectangle, alignLineRefs[0].isHorizontal);
        }

        if (drawHorizontal && alignLineRefs[1].alignRectangles.length) {
            const rightRectangle =
                alignLineRefs[1].alignRectangles.length === 1
                    ? alignLineRefs[1].alignRectangles[0]
                    : getNearestAlignRectangle(alignLineRefs[1].alignRectangles, activeRectangle);
            setAlignLine(alignLineRefs[1].axis, rightRectangle, alignLineRefs[1].isHorizontal);
        }

        if (drawVertical && alignLineRefs[2].alignRectangles.length) {
            const topRectangle =
                alignLineRefs[2].alignRectangles.length === 1
                    ? alignLineRefs[2].alignRectangles[0]
                    : getNearestAlignRectangle(alignLineRefs[2].alignRectangles, activeRectangle);
            setAlignLine(alignLineRefs[2].axis, topRectangle, alignLineRefs[2].isHorizontal);
        }

        if (drawVertical && alignLineRefs[3].alignRectangles.length) {
            const bottomRectangle =
                alignLineRefs[3].alignRectangles.length === 1
                    ? alignLineRefs[3].alignRectangles[0]
                    : getNearestAlignRectangle(alignLineRefs[3].alignRectangles, activeRectangle);
            setAlignLine(alignLineRefs[3].axis, bottomRectangle, alignLineRefs[3].isHorizontal);
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
        const alignLinesG = this.drawAlignLines(equalLineRef.activePoints, resizeAlignOptions);
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

function drawAlignLines(board: PlaitBoard, lines: [Point, Point][]) {
    const g = createG();
    lines.forEach(points => {
        if (!points.length) return;
        const xAlign = PlaitBoard.getRoughSVG(board).line(points[0][0], points[0][1], points[1][0], points[1][1], {
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

export const getClosestDelta = (axis: number, rectangle: RectangleClient, isHorizontal: boolean) => {
    const alignAxis = getTripleAlignAxis(rectangle, isHorizontal);
    const deltas = alignAxis.map(item => item - axis);
    const absDeltas = deltas.map(item => Math.abs(item));
    const index = absDeltas.indexOf(Math.min(...absDeltas));
    return deltas[index];
};

function getMinAlignDelta(alignRectangles: RectangleClient[], axis: number, isHorizontal: boolean) {
    let delta = ALIGN_TOLERANCE;

    alignRectangles.forEach(item => {
        const distance = getClosestDelta(axis, item, isHorizontal);
        if (Math.abs(distance) < Math.abs(delta)) {
            delta = distance;
        }
    });
    return delta;
}

function getNearestAlignRectangle(alignRectangles: RectangleClient[], activeRectangle: RectangleClient) {
    let minDistance = Infinity;
    let nearestRectangle = alignRectangles[0];

    alignRectangles.forEach(item => {
        const distance = Math.sqrt(Math.pow(activeRectangle.x - item.x, 2) + Math.pow(activeRectangle.y - item.y, 2));
        if (distance < minDistance) {
            minDistance = distance;
            nearestRectangle = item;
        }
    });
    return nearestRectangle;
}
