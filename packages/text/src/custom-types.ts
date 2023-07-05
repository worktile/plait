import { BaseElement } from 'slate';
import { AngularEditor } from 'slate-angular';

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
}

export type CustomElement = ParagraphElement | LinkElement;

export type TextPlugin = (editor: AngularEditor) => AngularEditor;
