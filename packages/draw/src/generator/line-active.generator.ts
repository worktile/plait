import { PlaitBoard, createG, drawCircle } from '@plait/core';
import { PlaitLine } from '../interfaces';
import { Generator, RESIZE_HANDLE_DIAMETER } from '@plait/common';
import { getSourcePoint, getTargetPoint } from '../utils';

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

    baseDraw(element: PlaitLine, data: ActiveData): SVGGElement {
        const activeG = createG();
        activeG.classList.add('active');
        this.g = activeG;
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
        this.g.appendChild(targetCircle);
        this.g.appendChild(sourceCircle);
        return activeG;
    }
}
