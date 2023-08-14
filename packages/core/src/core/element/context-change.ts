import { PlaitBoard, PlaitElement } from '../../interfaces';
import { PlaitPluginElementContext } from './context';

export interface BeforeContextChange<T extends PlaitElement = PlaitElement, K extends PlaitBoard = PlaitBoard> {
    beforeContextChange: (value: PlaitPluginElementContext<T>) => void;
}

export interface OnContextChanged<T extends PlaitElement = PlaitElement, K extends PlaitBoard = PlaitBoard> {
    onContextChanged: (value: PlaitPluginElementContext<T, K>, previous: PlaitPluginElementContext<T, K>) => void;
}

export function hasBeforeContextChange<T extends PlaitElement = PlaitElement, K extends PlaitBoard = PlaitBoard>(
    value: any
): value is BeforeContextChange<T, K> {
    if (value.beforeContextChange) {
        return true;
    }
    return false;
}

export function hasOnContextChanged<T extends PlaitElement = PlaitElement, K extends PlaitBoard = PlaitBoard>(
    value: any
): value is OnContextChanged<T, K> {
    if (value.onContextChanged) {
        return true;
    }
    return false;
}
