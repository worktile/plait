import { Element } from 'slate';

export const buildText = (text: string | Element) => {
    return typeof text === 'string' ? { children: [{ text }] } : text;
};
