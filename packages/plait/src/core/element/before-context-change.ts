import { PlaitElement } from "../../interfaces";
import { PlaitPluginElementContext } from "./context";

export interface BeforeContextChange<T extends PlaitElement = PlaitElement> {
    beforeContextChange: (value: PlaitPluginElementContext<T>) => void;
}

export function hasBeforeContextChange<T extends PlaitElement = PlaitElement>(value: any): value is BeforeContextChange<T> {
    if (value.beforeContextChange) {
        return true;
    }
    return false;
}
