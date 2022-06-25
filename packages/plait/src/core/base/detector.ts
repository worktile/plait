import { Point } from '../../interfaces/point';
import { PlaitElement } from '../../interfaces/element';
import { Selection } from '../../interfaces/selection';

export interface BaseDetector {
    contian: (selection: Selection, element: PlaitElement) => boolean; // 框选
    hit: (point: Point, element: PlaitElement) => boolean;
}
