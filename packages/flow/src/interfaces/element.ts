import { Element, Point } from 'slate';
import { PlaitElement } from '@plait/core';

export const isFlowElement = (value: PlaitElement): value is FlowElement => {
    return ['node', 'edge'].includes(value.type);
};

export const isFlowEdgeElement = (value: PlaitElement): value is FlowElement => {
    return value.type === 'edge';
};

export type FlowType = 'node' | 'edge';

export enum FlowPosition {
    left = 'left',
    top = 'top',
    right = 'right',
    bottom = 'bottom'
}

export interface FlowHandle {
    position: FlowPosition;
    handleId?: string;
    offsetX?: number;
    offsetY?: number;
}

export interface FlowEdge {
    node: FlowElement;
    position: FlowPosition;
    handleId?: string;
}

export interface FlowElement extends PlaitElement {
    id: string;
    type: FlowType;
    data: {
        value: Element;
        [key: string]: any;
    };
    width?: number;
    height?: number;
    source?: FlowEdge;
    target?: FlowEdge;
    handles?: FlowHandle[];
    deletable?: boolean;
    [key: string]: any;
}
