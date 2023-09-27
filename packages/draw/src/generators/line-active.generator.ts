import { PlaitBoard, createG, drawCircle, drawRectangle, getSelectedElements } from '@plait/core';
import { PlaitLine } from '../interfaces';
import { Generator, PRIMARY_COLOR, RESIZE_HANDLE_DIAMETER, getRectangleByPoints } from '@plait/common';
import { getLinePoints, getSourcePoint, getTargetPoint } from '../utils';
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
            const sourcePoint = getSourcePoint(this.board, element);
            const targetPoint = getTargetPoint(this.board, element);
            const sourceCircle = drawCircle(PlaitBoard.getRoughSVG(this.board), sourcePoint, RESIZE_HANDLE_DIAMETER, {
                stroke: '#999999',
                strokeWidth: 1,
                fill: '#FFF',
                fillStyle: 'solid'
            });
            const targetCircle = drawCircle(PlaitBoard.getRoughSVG(this.board), targetPoint, RESIZE_HANDLE_DIAMETER, {
                stroke: '#999999',
                strokeWidth: 1,
                fill: '#FFF',
                fillStyle: 'solid'
            });
            activeG.appendChild(targetCircle);
            activeG.appendChild(sourceCircle);
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
