import { Element, Point } from 'slate';
import { PlaitElement } from '@plait/core';

export const isFlowElement = (value: PlaitElement): value is FlowElement => {
    return [FlowElementType.node, FlowElementType.edge].includes(value.type as FlowElementType);
};

export enum FlowElementType {
    node = 'node',
    edge = 'edge'
}

export enum FlowPosition {
    left = 'left',
    top = 'top',
    right = 'right',
    bottom = 'bottom'
}

export interface FlowElement extends PlaitElement {
    id: string;
    type: FlowElementType;
    data: {
        value: Element;
        [key: string]: any;
    };
    deletable?: boolean;
}
