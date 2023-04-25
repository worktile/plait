import { PlaitElement } from '../../interfaces';
import { PlaitPluginElementContext } from './context';

export interface BeforeContextChange<T extends PlaitElement = PlaitElement> {
    beforeContextChange: (value: PlaitPluginElementContext<T>) => void;
}

export interface OnContextChanged<T extends PlaitElement = PlaitElement> {
    onContextChanged: (value: PlaitPluginElementContext<T>, previous: PlaitPluginElementContext<T>) => void;
}

export function hasBeforeContextChange<T extends PlaitElement = PlaitElement>(value: any): value is BeforeContextChange<T> {
    if (value.beforeContextChange) {
        return true;
    }
    return false;
}

export function hasOnContextChanged<T extends PlaitElement = PlaitElement>(value: any): value is OnContextChanged<T> {
    if (value.onContextChanged) {
        return true;
    }
    return false;
}
