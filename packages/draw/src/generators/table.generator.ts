import { TableSymbols } from '../interfaces';
import { Generator } from '@plait/common';
import { RectangleClient } from '@plait/core';
import { PlaitTable } from '../interfaces/table';
import { getEngine } from '../engines';
import { getDrawDefaultStrokeColor, getFillByElement } from '../utils';

export interface TableData {}

export class TableGenerator extends Generator<PlaitTable, TableData> {
    canDraw(element: PlaitTable, data: TableData): boolean {
        return true;
    }

    draw(element: PlaitTable, data: TableData) {
        const rectangle = RectangleClient.getRectangleByPoints(element.points);
        const fill = getFillByElement(this.board, element);
        return getEngine(TableSymbols.table).draw(
            this.board,
            rectangle,
            {
                strokeWidth: 2,
                stroke: getDrawDefaultStrokeColor(this.board.theme.themeColorMode),
                fill
            },
            element
        );

    }
}
