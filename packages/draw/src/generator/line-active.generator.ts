import { PlaitBoard, createG, drawCircle } from '@plait/core';
import { PlaitLine } from '../interfaces';
import { Generator, RESIZE_HANDLE_DIAMETER } from '@plait/common';

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
        this.g = activeG;
        const sourcePoint = element.points[0];
        const targetPoint = element.points[element.points.length - 1];

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
