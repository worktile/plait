import { Element } from 'slate';

export interface EmojiItem {
    name: string;
}

export interface ImageItem {
    url: string;
    width: number;
    height: number;
}

export interface BaseData {
    topic: Element;
    emojis?: EmojiItem[];
    image?: ImageItem;
}

export interface EmojiData extends BaseData {
    emojis: EmojiItem[];
}

export interface ImageData extends BaseData {
    image: ImageItem;
}
