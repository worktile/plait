import { PlaitBoard, Point, createG, drawCircle, drawRectangle } from '@plait/core';
import { LineShape, PlaitLine } from '../interfaces';
import { Generator, PRIMARY_COLOR, RESIZE_HANDLE_DIAMETER, getRectangleByPoints } from '@plait/common';
import { getLinePoints } from '../utils';
import { DefaultGeometryActiveStyle } from '../constants';

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
            getMiddlePoints(element.shape, points).forEach(point => {
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

export function getMiddlePoints(shape: LineShape, points: Point[]) {
    const result: Point[] = [];
    if (shape === LineShape.straight) {
        for (let i = 0; i < points.length - 1; i++) {
            result.push([(points[i][0] + points[i + 1][0]) / 2, (points[i][1] + points[i + 1][1]) / 2]);
        }
    }
    if (shape === LineShape.curve) {

    }
    return result;
}
