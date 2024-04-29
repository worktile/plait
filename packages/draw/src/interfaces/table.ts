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
    relatedIds: {
        relatedId: string;
        childId: string;
    }[];
}

export interface PlaitTableCell {
    id: string;
    rowId: string;
    columnId: string;
    colspan?: number;
    rowspan?: number;
    text?: PlaitTableCellParagraph;
}

export interface PlaitTableCellParagraph extends ParagraphElement {
    writingMode: 'vertical-lr' | 'horizontal-tb';
}
