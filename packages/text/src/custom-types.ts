import { BaseElement } from 'slate';
import { AngularEditor } from 'slate-angular';

export enum Alignment {
    left = 'left',
    center = 'center',
    right = 'right'
}

export enum WritingMode {
    verticalLR = 'vertical-lr',
    horizontalTB = 'horizontal-tb'
}

export type CustomText = {
    bold?: boolean;
    italic?: boolean;
    strike?: boolean;
    code?: boolean;
    text: string;
    underlined?: boolean;
    color?: string;
    [`font-size`]?: string;
};

export interface LinkElement extends BaseElement {
    type: 'link';
    url: string;
}

export interface ParagraphElement extends BaseElement {
    align?: Alignment;
    writingMode?: WritingMode;
}

export type CustomElement = ParagraphElement | LinkElement;

export type TextPlugin = (editor: AngularEditor) => AngularEditor;
