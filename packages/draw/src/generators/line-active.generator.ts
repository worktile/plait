import {
    PlaitBoard,
    Point,
    createG,
    distanceBetweenPointAndPoint,
    drawCircle,
    drawRectangle,
    getSelectedElements,
    isPointsOnSameLine
} from '@plait/core';
import { LineShape, PlaitLine } from '../interfaces';
import { Generator, PRIMARY_COLOR, RESIZE_HANDLE_DIAMETER } from '@plait/common';
import { getCurvePoints } from '../utils/line/line-basic';
import { DefaultGeometryActiveStyle } from '../constants';
import { getElbowPoints, getNextSourceAndTargetPoints } from '../utils/line/elbow';

export interface ActiveData {
    selected: boolean;
}

export class LineActiveGenerator extends Generator<PlaitLine, ActiveData> {
    canDraw(element: PlaitLine, data: ActiveData): boolean {
        if (data.selected) {
            return true;
        } else {
            return false;
        }
    }

    draw(element: PlaitLine, data: ActiveData): SVGGElement {
        const activeG = createG();
        const selectedElements = getSelectedElements(this.board);
        const isSingleSelection = selectedElements.length === 1;
        if (isSingleSelection) {
            activeG.classList.add('active');
            activeG.classList.add('line-handle');
            let points = PlaitLine.getPoints(this.board, element);
            if (element.shape === LineShape.elbow) {
                points = points.slice(0, 1).concat(points.slice(-1));
            }
            points.forEach(point => {
                const circle = drawCircle(PlaitBoard.getRoughSVG(this.board), point, RESIZE_HANDLE_DIAMETER, {
                    stroke: '#999999',
                    strokeWidth: 1,
                    fill: '#FFF',
                    fillStyle: 'solid'
                });
                activeG.appendChild(circle);
            });
            getMiddlePoints(this.board, element).forEach(point => {
                const circle = drawCircle(PlaitBoard.getRoughSVG(this.board), point, RESIZE_HANDLE_DIAMETER, {
                    stroke: '#FFFFFF80',
                    strokeWidth: 1,
                    fill: `${PRIMARY_COLOR}80`,
                    fillStyle: 'solid'
                });
                activeG.appendChild(circle);
            });
        } else {
            const activeRectangle = this.board.getRectangle(element);
            if (activeRectangle) {
                let opacity = '0.5';
                if (activeRectangle.height === 0 || activeRectangle.width === 0) {
                    opacity = '0.8';
                }
                const strokeG = drawRectangle(this.board, activeRectangle, {
                    stroke: PRIMARY_COLOR,
                    strokeWidth: DefaultGeometryActiveStyle.selectionStrokeWidth
                });
                strokeG.style.opacity = opacity;
                activeG.appendChild(strokeG);
            }
        }
        return activeG;
    }
}

export function getMiddlePoints(board: PlaitBoard, element: PlaitLine) {
    const result: Point[] = [];
    const shape = element.shape;
    const hideBuffer = 10;
    if (shape === LineShape.straight) {
        const points = PlaitLine.getPoints(board, element);
        for (let i = 0; i < points.length - 1; i++) {
            const distance = distanceBetweenPointAndPoint(...points[i], ...points[i + 1]);
            if (distance < hideBuffer) continue;
            result.push([(points[i][0] + points[i + 1][0]) / 2, (points[i][1] + points[i + 1][1]) / 2]);
        }
    }
    if (shape === LineShape.curve) {
        const points = PlaitLine.getPoints(board, element);
        const pointsOnBezier = getCurvePoints(board, element);
        if (points.length === 2) {
            const start = 0;
            const endIndex = pointsOnBezier.length - 1;
            const middleIndex = Math.round((start + endIndex) / 2);
            result.push(pointsOnBezier[middleIndex]);
        } else {
            for (let i = 0; i < points.length - 1; i++) {
                const startIndex = pointsOnBezier.findIndex(point => point[0] === points[i][0] && point[1] === points[i][1]);
                const endIndex = pointsOnBezier.findIndex(point => point[0] === points[i + 1][0] && point[1] === points[i + 1][1]);
                const middleIndex = Math.round((startIndex + endIndex) / 2);
                const distance = distanceBetweenPointAndPoint(...points[i], ...points[i + 1]);
                if (distance < hideBuffer) continue;
                result.push(pointsOnBezier[middleIndex]);
            }
        }
    }
    if (shape === LineShape.elbow) {
        const pointsOnElbow = getElbowPoints(board, element);
        if (isPointsOnSameLine(pointsOnElbow)) {
            const points = PlaitLine.getPoints(board, element);
            const middlePoint = [(points[0][0] + points[1][0]) / 2, (points[1][1] + points[1][1]) / 2] as Point;
            result.push(middlePoint);
        } else {
            const [nextSourcePoint, nextTargetPoint] = getNextSourceAndTargetPoints(board, element);
            for (let i = 0; i < pointsOnElbow.length - 1; i++) {
                if (
                    (i == 0 && Point.isEquals(pointsOnElbow[i + 1], nextSourcePoint)) ||
                    (i === pointsOnElbow.length - 2 && Point.isEquals(pointsOnElbow[pointsOnElbow.length - 2], nextTargetPoint))
                ) {
                    continue;
                }
                const [currentX, currentY] = pointsOnElbow[i];
                const [nextX, nextY] = pointsOnElbow[i + 1];
                const middlePoint = [(currentX + nextX) / 2, (currentY + nextY) / 2] as Point;
                result.push(middlePoint);
            }
        }
    }
    return result;
}
