import { PlaitBoard } from '@plait/core';
import { Element } from 'slate';
import { AngularEditor, ViewType } from 'slate-angular';

export interface PlaitTextEditor extends AngularEditor {
    renderElement?: (element: Element) => ViewType;
    board?: PlaitBoard;
}
