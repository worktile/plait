import { PlaitText, TableSymbols } from '../interfaces';
import { Generator, WithTextOptions, WithTextPluginKey } from '@plait/common';
import { PlaitBoard, PlaitOptionsBoard, RectangleClient } from '@plait/core';
import { PlaitTable } from '../interfaces/table';
import { getEngine } from '../engines';
import { TextManageRef, TextPlugin } from '@plait/text';
import { DrawTransforms } from '../transforms';
import { getCellsWithPoints } from '../utils/table';
import { GeometryThreshold } from '../constants';
import { getTextRectangle, memorizeLatestText } from '../utils';

export interface TableData {}

export class TableGenerator extends Generator<PlaitTable, TableData> {
    canDraw(element: PlaitTable, data: TableData): boolean {
        return true;
    }

    draw(element: PlaitTable, data: TableData) {
        const rectangle = RectangleClient.getRectangleByPoints(element.points);
        return getEngine(TableSymbols.table).draw(
            this.board,
            rectangle,
            {
                strokeWidth: 1,
                stroke: '#333'
            },
            {
                element: element
            }
        );
    }
}

export class TableCellTextGenerator {
    protected board: PlaitBoard;

    public textPlugins: TextPlugin[] | undefined;

    constructor(board: PlaitBoard) {
        this.board = board;
        this.textPlugins = ((this.board as PlaitOptionsBoard).getPluginOptions<WithTextOptions>(WithTextPluginKey) || {}).textPlugins;
    }

    getRectangle(table: PlaitTable, cellIndex: number) {
        const cells = getCellsWithPoints(table);
        const getRectangle = getEngine<PlaitTable>(TableSymbols.table).getTextRectangle;
        if (getRectangle) {
            return getRectangle(table, {
                cell: cells[cellIndex]
            });
        }
        return getTextRectangle(cells[cellIndex]);
    }
    onValueChangeHandle(textManageRef: TextManageRef, table: PlaitTable, cellIndex: number) {
        const cells = getCellsWithPoints(table);
        const height = textManageRef.height / this.board.viewport.zoom;
        const width = textManageRef.width / this.board.viewport.zoom;
        if (textManageRef.newValue) {
            DrawTransforms.setText(this.board, cells[cellIndex], textManageRef.newValue, width, height);
        } else {
            DrawTransforms.setTextSize(this.board, cells[cellIndex], width, height);
        }
        textManageRef.operations && memorizeLatestText(table, textManageRef.operations);
    }
    getMaxWidth(table: PlaitTable, cellIndex: number) {
        const cells = getCellsWithPoints(table);
        let width = getTextRectangle(cells[cellIndex]).width;
        const getRectangle = getEngine<PlaitTable>(TableSymbols.table).getTextRectangle;
        if (getRectangle) {
            width = getRectangle(table, cells[cellIndex]).width;
        }
        return ((cells[cellIndex] as unknown) as PlaitText)?.autoSize ? GeometryThreshold.defaultTextMaxWidth : width;
    }
}
