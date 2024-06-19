import { TableSymbols } from '../interfaces';
import { Generator } from '@plait/common';
import { PlaitElement, RectangleClient } from '@plait/core';
import { PlaitBaseTable } from '../interfaces/table';
import { getEngine } from '../engines';
import { getDrawDefaultStrokeColor, getFillByElement, getLineDashByElement, getStrokeColorByElement, getStrokeWidthByElement } from '../utils';

export interface TableData {}

export class TableGenerator<T extends PlaitElement = PlaitBaseTable> extends Generator<T, TableData> {
    canDraw(element: T, data: TableData): boolean {
        return true;
    }

    draw(element: T, data: TableData) {
        const rectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeLineDash = getLineDashByElement(element);
        const strokeWidth = getStrokeWidthByElement(element);
        const strokeColor = getStrokeColorByElement(this.board, element);
        return getEngine(TableSymbols.table).draw(
            this.board,
            rectangle,
            {
                strokeWidth,
                stroke: strokeColor,
                strokeLineDash,
            },
            {
                element: element
            }
        );
    }
}
