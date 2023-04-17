import { Point } from './point';

export interface PlaitElement {
    [key: string]: any;
    id: string;
    children?: PlaitElement[];
    points?: Point[];
    type?: string;
}

export const PlaitElement = {
    isElement(value: any): value is PlaitElement {
        return !!value.id;
    }
}

export interface ComponentType<T> {
    new (...args: any[]): T;
}
