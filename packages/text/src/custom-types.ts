import { BaseElement } from 'slate';

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

export type CustomElement = LinkElement | BaseElement;
