import { PlaitElement, Point } from '@plait/core';
import { ParagraphElement, WritingMode } from '@plait/text';

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
    text?: ParagraphElement;
    textHeight?: number;
}

export const PlaitTableElement = {
    isTable: (value: any): value is PlaitTable => {
        return value.rows && value.columns && value.cells;
    },
    isVerticalCell: (value: PlaitTableCell): value is PlaitTableCell => {
        return value.text?.writingMode === WritingMode.verticalLR;
    }
};
