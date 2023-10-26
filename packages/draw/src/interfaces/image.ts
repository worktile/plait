import { PlaitElement, Point } from '@plait/core';

export interface PlaitImage extends PlaitElement {
    points: [Point, Point];
    type: 'image';
    url: string;
    width: number;
    height: number;
    angle: number;
}
