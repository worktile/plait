import { PlaitElement } from '@plait/core';
import { ParagraphElement } from '@plait/text';

export interface PlaitTable extends PlaitElement {
    id: string;
    rows: {
        id: string;
        height?: number;
    }[];
    columns: {
        id: string;
        width?: number;
    }[];
    cells: PlaitTableCell[];
    mergeable?: boolean;
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
    // 是否可编辑
    editable?: boolean;
}

export interface PlaitTableCellParagraph extends ParagraphElement {
    writingMode: 'vertical-lr' | 'horizontal-tb';
}
