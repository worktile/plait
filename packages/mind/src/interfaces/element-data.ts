import { CommonImageItem } from '@plait/common';
import { ParagraphElement } from '@plait/text';

export interface EmojiItem {
    name: string;
}

export interface BaseData {
    topic: ParagraphElement;
    emojis?: EmojiItem[];
    image?: CommonImageItem;
}

export interface EmojiData extends BaseData {
    emojis: EmojiItem[];
}

export interface ImageData extends BaseData {
    image: CommonImageItem;
}
