import { Point } from '../../interfaces/point';
import { PlaitElement } from '../../interfaces/element';
import { Range } from '../../interfaces/selection';

export interface BaseDetector {
    contian: (selection: Range, element: PlaitElement) => boolean; // 框选
    hit: (point: Point, element: PlaitElement) => boolean;
}
