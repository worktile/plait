import { PlaitElement, Point } from '@plait/core';

export interface PlaitCommonImage extends PlaitElement {
    points: [Point, Point];
    type: 'image';
    angle: number;
    tableId?: string;
}

export interface PlaitImage extends PlaitCommonImage {
    url: string;
}

// export interface PlaitEmojiImage extends PlaitElement {
//     sourceType: 'emoji',
//     emojiName: ''
// }
