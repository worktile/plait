import { RectangleClient, createG } from '@plait/core';
import { PlaitGeometry } from '../interfaces';
import { getStrokeWidthByElement } from '../utils/geometry-style/stroke';
import { PRIMARY_COLOR, drawRectangle, getRectangleByPoints, Generator } from '@plait/common';
import { DefaultGeometryActiveStyle } from '../constants/geometry';

export interface ActiveData {
    selected: boolean;
}

export class GeometryActiveGenerator extends Generator<PlaitGeometry, ActiveData> {
    canDraw(element: PlaitGeometry, data: ActiveData): boolean {
        if (data.selected) {
            return true;
        } else {
            return false;
        }
    }

    baseDraw(element: PlaitGeometry, data: ActiveData): SVGGElement {
        const activeG = createG();
        this.g = activeG;

        const rectangle = getRectangleByPoints(element.points);
        // add 0.1 to avoid white gap
        const offset = (getStrokeWidthByElement(element) + DefaultGeometryActiveStyle.strokeWidth) / 2 - 0.1;
        const activeRectangle = RectangleClient.getOutlineRectangle(rectangle, -offset);

        const strokeG = drawRectangle(this.board, activeRectangle, {
            stroke: PRIMARY_COLOR,
            strokeWidth: DefaultGeometryActiveStyle.strokeWidth
        });
        this.g.appendChild(strokeG);
        return activeG;
    }
}
