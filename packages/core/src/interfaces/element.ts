import { ELEMENT_TO_REF, NODE_TO_CONTAINER_G, NODE_TO_G, NODE_TO_PARENT } from '../utils';
import { PlaitBoard } from './board';
import { Point } from './point';
import { PlaitElementRef } from '../core/element/element-ref';

export interface PlaitElement {
    [key: string]: any;
    id: string;
    children?: PlaitElement[];
    points?: Point[];
    type?: string;
    groupId?: string;
    angle?: number;
}

export const PlaitElement = {
    isRootElement(value: PlaitElement) {
        const parent = NODE_TO_PARENT.get(value);
        if (parent && PlaitBoard.isBoard(parent)) {
            return true;
        } else {
            return false;
        }
    },
    getElementRef<T extends PlaitElementRef = PlaitElementRef>(value: PlaitElement) {
        return ELEMENT_TO_REF.get(value) as T;
    },
    getElementG(value: PlaitElement) {
        const g = NODE_TO_G.get(value);
        if (!g) {
            throw new Error(`can not resolve element g: ${JSON.stringify(value)}`);
        }
        return g;
    },
    hasMounted(element: PlaitElement) {
        const containerG = PlaitElement.getContainerG(element, { suppressThrow: true });
        if (containerG) {
            return true;
        } else {
            return false;
        }
    },
    getContainerG<T extends boolean>(
        value: PlaitElement,
        options: {
            suppressThrow: T;
        }
    ): T extends true ? SVGGElement | null : SVGGElement {
        const containerG = NODE_TO_CONTAINER_G.get(value) || null;
        if (!containerG) {
            if (options.suppressThrow) {
                return null as T extends true ? SVGGElement | null : SVGGElement;
            }
            throw new Error('can not resolve container g');
        }
        return containerG;
    }
};

export interface ComponentType<T> {
    new (...args: any[]): T;
}

export interface ImageEntry {
    url: string;
    file: File;
}
