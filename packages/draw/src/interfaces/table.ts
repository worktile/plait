import { PlaitElement, Point } from '@plait/core';
import { ParagraphElement } from '@plait/text';

export interface PlaitTable extends PlaitElement {
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

export interface PlaitTableCell extends PlaitElement {
    id: string;
    rowId: string;
    columnId: string;
    colspan?: number;
    rowspan?: number;
    text?: PlaitTableCellParagraph;
    textHeight?: number;
}

export interface PlaitTableCellParagraph extends ParagraphElement {
    writingMode: 'vertical-lr' | 'horizontal-tb';
}

export const PlaitTableElement = {
    isTable: (value: any): value is PlaitTable => {
        return value.rows && value.columns && value.cells;
    }
};
