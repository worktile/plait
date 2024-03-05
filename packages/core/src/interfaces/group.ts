import { PlaitElement } from "./element";

export interface PlaitGroup extends PlaitElement {
    type: 'group';
}

export const PlaitGroupElement = {
    isGroup: (value: any): value is PlaitGroup => {
        return value.type === 'group';
    }
}