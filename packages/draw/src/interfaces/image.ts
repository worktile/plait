import { PlaitElement, Point } from '@plait/core';

export interface PlaitCommonImage extends PlaitElement {
    points: [Point, Point];
    type: 'image';
    angle: number;
}

export interface PlaitImage extends PlaitCommonImage {
    url: string;
}
