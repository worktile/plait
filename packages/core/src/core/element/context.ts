import { PlaitBoard, PlaitElement, Selection } from '../../interfaces';
import { PlaitEffect } from '../children/effect';

export interface PlaitPluginElementContext<T extends PlaitElement = PlaitElement, K extends PlaitBoard = PlaitBoard> {
    element: T;
    parent: T | K;
    selected: boolean;
    board: K;
    effect?: PlaitEffect;
}
