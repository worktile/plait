import { PlaitNode } from './node';
import { Point } from './point';

export interface PlaitElement extends PlaitNode {
    points: Point[];
    type: string;
}
