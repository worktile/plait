import { BaseElement, Editor } from 'slate';

export enum Alignment {
    left = 'left',
    center = 'center',
    right = 'right'
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
}

export type CustomElement = ParagraphElement | LinkElement;

export type TextPlugin = (editor: Editor) => Editor;