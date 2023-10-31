import { PlaitElement, Point } from '@plait/core';
import { GeometryShape } from './geometry';

export interface PlaitImage extends PlaitElement {
    points: [Point, Point];
    type: 'image';
    url: string;
    angle: number;
    shape: GeometryShape.rectangle;
}
