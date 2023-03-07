import { PlaitNode } from './node';
import { Point } from './point';

export interface PlaitElement extends PlaitNode {
    id: string;
    points?: Point[];
    type?: string;
}

export const PlaitElement = {
    isElement: (value: any): value is PlaitElement => {
        return !!value.id;
    }
}

export interface ComponentType<T> {
    new(...args: any[]): T;
}