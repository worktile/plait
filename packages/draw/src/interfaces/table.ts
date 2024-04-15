import { PlaitElement, Point } from '@plait/core';
import { EngineExtraData } from './engine';
import { ParagraphElement } from '@plait/text';

export interface PlaitTable extends PlaitElement {
    id: string;
    points: Point[];
    type: 'table';
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

export interface PlaitTableCell {
    id: string;
    rowId: string;
    columnId: string;
    colspan?: number;
    rowspan?: number;
    text?: PlaitTableCellParagraph;
    textHeight?: number;
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
