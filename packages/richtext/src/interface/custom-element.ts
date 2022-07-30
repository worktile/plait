import { BaseElement, Text } from 'slate';

export type LinkElement = { type: 'link'; url: string; children: [Text] };
export type CustomElement = LinkElement | BaseElement;
