import { PlaitElement, Point } from '@plait/core';

export interface RotateRef<T extends PlaitElement = PlaitElement> {
    elements: T[];
    startPoint: Point;
    angle?: number;
}
