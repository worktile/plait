import { PlaitElement, Point } from '@plait/core';

export interface PlaitImage extends PlaitElement {
    points: [Point, Point];
    type: 'image';
    url: string;
    angle: number;
}
