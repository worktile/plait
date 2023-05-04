import { Element } from 'slate';

export interface EmojiItem {
    name: string;
}

export interface BaseData {
    topic: Element;
    emojis?: EmojiItem[];
}

export interface EmojiData extends BaseData {
    emojis: EmojiItem[];
}
