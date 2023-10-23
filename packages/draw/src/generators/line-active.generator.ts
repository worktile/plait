import { PlaitBoard, Point, createG, drawCircle, drawRectangle } from '@plait/core';
import { LineShape, PlaitLine } from '../interfaces';
import { Generator, PRIMARY_COLOR, RESIZE_HANDLE_DIAMETER, getRectangleByPoints } from '@plait/common';
import { getLinePoints, removeDuplicatePoints, transformOpsToPoints } from '../utils';
import { DefaultGeometryActiveStyle } from '../constants';
import { pointsOnBezierCurves } from 'points-on-curve';

export interface ActiveData {
    selected: boolean;
}

export class LineActiveGenerator extends Generator<PlaitLine, ActiveData> {
    hasResizeHandle = false;

    canDraw(element: PlaitLine, data: ActiveData): boolean {
        if (data.selected) {
            return true;
        } else {
            return false;
        }
    }

    baseDraw(element: PlaitLine, data: ActiveData): SVGGElement {
        const activeG = createG();
        if (this.hasResizeHandle) {
            activeG.classList.add('active');
            activeG.classList.add('line-handle');
            const points = PlaitLine.getPoints(this.board, element);
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
            const points = getLinePoints(this.board, element);
            const activeRectangle = getRectangleByPoints(points);
            const strokeG = drawRectangle(this.board, activeRectangle, {
                stroke: PRIMARY_COLOR,
                strokeWidth: DefaultGeometryActiveStyle.selectionStrokeWidth
            });
            activeG.appendChild(strokeG);
        }

        return activeG;
    }
}

export function getMiddlePoints(board: PlaitBoard, element: PlaitLine) {
    const result: Point[] = [];
    const shape = element.shape;
    if (shape === LineShape.straight) {
        const points = PlaitLine.getPoints(board, element);
        for (let i = 0; i < points.length - 1; i++) {
            result.push([(points[i][0] + points[i + 1][0]) / 2, (points[i][1] + points[i + 1][1]) / 2]);
        }
    }
    if (shape === LineShape.curve) {
        const points = PlaitLine.getPoints(board, element);
        if (points.length === 2) {
            result.push([(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2]);
        } else {
            const draw = PlaitBoard.getRoughSVG(board).generator.curve(points);
            let bezierPoints = transformOpsToPoints(draw.sets[0].ops) as Point[];
            bezierPoints = removeDuplicatePoints(bezierPoints);
            const pointsOnBezier = pointsOnBezierCurves(bezierPoints) as Point[];
            for (let i = 0; i < points.length - 1; i++) {
                const startIndex = pointsOnBezier.findIndex(point => point[0] === points[i][0] && point[1] === points[i][1]);
                const endIndex = pointsOnBezier.findIndex(point => point[0] === points[i + 1][0] && point[1] === points[i + 1][1]);
                const middleIndex = Math.round((startIndex + endIndex) / 2);
                result.push(pointsOnBezier[middleIndex]);
            }
        }
    }
    return result;
}
