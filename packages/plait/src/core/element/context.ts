import { PlaitBoard, PlaitElement, Selection } from '../../interfaces';
import { PlaitEffect } from '../children/effect';

export interface PlaitPluginElementContext<T extends PlaitElement = PlaitElement> {
    element: T;
    selected: boolean;
    board: PlaitBoard;
    effect?: PlaitEffect;
}
