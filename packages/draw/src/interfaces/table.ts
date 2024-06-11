import { PlaitBoard, PlaitElement, Point } from '@plait/core';
import { EngineExtraData } from './engine';
import { ParagraphElement } from '@plait/common';

export enum TableSymbols {
    table = 'table'
}

export interface PlaitTableBoard extends PlaitBoard {
    buildTable: (element: PlaitBaseTable) => PlaitBaseTable;
}

export interface PlaitBaseTable extends PlaitElement {
    id: string;
    points: Point[];
    rows: {
        id: string;
        height?: number;
    }[];
    columns: {
        id: string;
        width?: number;
    }[];
    cells: PlaitTableCell[];
    groupId?: string;
}

export interface PlaitTable extends PlaitBaseTable {
    type: 'table';
}

export interface PlaitTableCell {
    id: string;
    rowId: string;
    columnId: string;
    colspan?: number;
    rowspan?: number;
    text?: PlaitTableCellParagraph;
    textHeight?: number;
    fill?: string;
}

export interface PlaitTableDrawOptions extends EngineExtraData {
    element: PlaitTable;
}

export interface PlaitTableCellWithPoints extends PlaitTableCell {
    points: [Point, Point];
}

export interface PlaitTableCellParagraph extends ParagraphElement {
    direction?: 'vertical' | 'horizontal';
}

export const PlaitTableElement = {
    isTable: (value: any): value is PlaitTable => {
        return value.type === 'table';
    },
    isVerticalText: (value: PlaitTableCell): value is PlaitTableCell => {
        return value.text?.direction === 'vertical';
    }
};
