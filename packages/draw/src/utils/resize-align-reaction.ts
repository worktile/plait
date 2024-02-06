import { ResizeState } from '@plait/common';
<<<<<<< HEAD
import { DirectionFactors, PlaitBoard, PlaitElement, Point, RectangleClient, SELECTION_BORDER_COLOR, createG, findElements } from '@plait/core';
=======
import { Direction, PlaitBoard, PlaitElement, Point, RectangleClient, SELECTION_BORDER_COLOR, createG, findElements } from '@plait/core';
>>>>>>> 2046f41a (feat(draw): render align lines #WIK-14486)
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
        const { isAspectRatio, activeRectangle } = resizeAlignOptions;
        const closestAlignRectangle = this.alignRectangles.find(item => {
            const { leftDistances, rightDistances, topDistances, bottomDistances } = calculateClosestDistances(activeRectangle, item);
            return [leftDistances.absDistance, rightDistances.absDistance, topDistances.absDistance, bottomDistances.absDistance].some(
                distance => distance < ALIGN_TOLERANCE && distance !== 0
            );
        });

        if (closestAlignRectangle) {
            const { leftDistances, rightDistances, topDistances, bottomDistances } = calculateClosestDistances(
                activeRectangle,
                closestAlignRectangle
            );
            alignLineDelta.deltaX = getDeltaByDistances(leftDistances, rightDistances);
            if (alignLineDelta.deltaX !== 0 && isAspectRatio) {
                alignLineDelta.deltaY = alignLineDelta.deltaX / (activeRectangle.width / activeRectangle.height);
                return alignLineDelta;
            }
            alignLineDelta.deltaY = getDeltaByDistances(topDistances, bottomDistances);
            if (alignLineDelta.deltaY !== 0 && isAspectRatio) {
                alignLineDelta.deltaX = alignLineDelta.deltaY * (activeRectangle.width / activeRectangle.height);
                return alignLineDelta;
            }
        }
        return alignLineDelta;
    }

    drawAlignLines(activePoints: Point[]) {
        const activeRectangle = RectangleClient.getRectangleByPoints(activePoints);
        let alignLinePoints: number[][] = [];
        for (let alignRectangle of this.alignRectangles) {
            const { leftDistances, rightDistances, topDistances, bottomDistances } = calculateClosestDistances(
                activeRectangle,
                alignRectangle
            );

            const xDistance = Math.min(leftDistances.absDistance, rightDistances.absDistance);
            if (xDistance === 0) {
                const verticalY = [
                    alignRectangle.y,
                    alignRectangle.y + alignRectangle.height,
                    activeRectangle.y,
                    activeRectangle.y + activeRectangle.height
                ];
                const lineTopY = Math.min(...verticalY) - ALIGN_SPACING;
                const lineBottomY = Math.max(...verticalY) + ALIGN_SPACING;
                if (leftDistances.distance === 0) {
                    const leftLine: number[] = [activeRectangle.x, lineTopY, activeRectangle.x, lineBottomY];
                    alignLinePoints.push(leftLine);
                }
                if (rightDistances.distance == 0) {
                    const rightLine = [
                        activeRectangle.x + activeRectangle.width,
                        lineTopY,
                        activeRectangle.x + activeRectangle.width,
                        lineBottomY
                    ];
                    alignLinePoints.push(rightLine);
                }
            }

            const yDistance = Math.min(topDistances.absDistance, bottomDistances.absDistance);
            if (yDistance === 0) {
                const horizontalX = [
                    alignRectangle.x,
                    alignRectangle.x + alignRectangle.width,
                    activeRectangle.x,
                    activeRectangle.x + activeRectangle.width
                ];
                const lineLeftX = Math.min(...horizontalX) - ALIGN_SPACING;
                const lineRightX = Math.max(...horizontalX) + ALIGN_SPACING;
                if (topDistances.distance === 0) {
                    const topLine = [lineLeftX, activeRectangle.y, lineRightX, activeRectangle.y];
                    alignLinePoints.push(topLine);
                }
                if (bottomDistances.distance == 0) {
                    const bottomLine = [
                        lineLeftX,
                        activeRectangle.y + activeRectangle.height,
                        lineRightX,
                        activeRectangle.y + activeRectangle.height
                    ];
                    alignLinePoints.push(bottomLine);
                }
            }
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

function calculateClosestDistances(activeRectangle: RectangleClient, alignRectangle: RectangleClient) {
    const leftDistances = calculateClosestDistancesByDirection(activeRectangle, alignRectangle, Direction.left);
    const rightDistances = calculateClosestDistancesByDirection(activeRectangle, alignRectangle, Direction.right);
    const topDistances = calculateClosestDistancesByDirection(activeRectangle, alignRectangle, Direction.top);
    const bottomDistances = calculateClosestDistancesByDirection(activeRectangle, alignRectangle, Direction.bottom);
    return {
        leftDistances,
        rightDistances,
        topDistances,
        bottomDistances
    };
}

function calculateClosestDistancesByDirection(activeRectangle: RectangleClient, alignRectangle: RectangleClient, direction: Direction) {
    let distances: number[];
    switch (direction) {
        case Direction.left:
            distances = [
                alignRectangle.x - activeRectangle.x,
                alignRectangle.x + alignRectangle.width / 2 - activeRectangle.x,
                alignRectangle.x + alignRectangle.width - activeRectangle.x
            ];
            break;
        case Direction.right:
            distances = [
                alignRectangle.x + alignRectangle.width - (activeRectangle.x + activeRectangle.width),
                alignRectangle.x + alignRectangle.width / 2 - (activeRectangle.x + activeRectangle.width),
                alignRectangle.x - (activeRectangle.x + activeRectangle.width)
            ];
            break;

        case Direction.top:
            distances = [
                alignRectangle.y - activeRectangle.y,
                alignRectangle.y + alignRectangle.height / 2 - activeRectangle.y,
                alignRectangle.y + alignRectangle.height - activeRectangle.y
            ];
            break;
        case Direction.bottom:
            distances = [
                alignRectangle.y + alignRectangle.height - (activeRectangle.y + activeRectangle.height),
                alignRectangle.y + alignRectangle.height / 2 - (activeRectangle.y + activeRectangle.height),
                alignRectangle.y - (activeRectangle.y + activeRectangle.height)
            ];
            break;
    }

    const distancesAbs = distances.map(distance => Math.abs(distance));
    const index = distancesAbs.indexOf(Math.min(...distancesAbs));

    return {
        absDistance: distancesAbs[index],
        distance: distances[index]
    };
}

function getDeltaByDistances(distance1: ResizeAlignDistance, distance2: ResizeAlignDistance): number {
    if (distance1.absDistance < ALIGN_TOLERANCE && distance1.absDistance !== 0) {
        return distance1.distance;
    } else if (distance2.absDistance < ALIGN_TOLERANCE && distance2.absDistance !== 0) {
        return distance2.distance;
    }
    return 0;
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
