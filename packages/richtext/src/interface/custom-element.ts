import { BaseElement, Text } from 'slate';

export type LinkElement = { type: 'link'; url: string; children: [Text] };

export type CustomElement = LinkElement;

declare module 'slate' {
    interface CustomTypes {
        Element: CustomElement | BaseElement
    }
}

export const CustomElement = {
    isCustomElement(value: any): value is CustomElement {
        if (value.type) {
            return true;
        }
        return false;
    }
}