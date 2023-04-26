import { Element } from 'slate';

export enum ItemPlacement {
    'before',
    'top'
}

export interface BaseItem {
    placement?: ItemPlacement
}

export interface EmojiItem extends BaseItem {
    name: string;
}

export interface BaseData {
    topic: Element;
    emojis?: EmojiItem[];
}

export interface EmojiData extends BaseData {
    emojis: EmojiItem[];
}
