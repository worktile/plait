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

export interface FlowElementStyle {
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
}

export interface FlowElement<T = unknown> extends PlaitElement {
    id: string;
    type: FlowElementType;
    data?: {
        text?: T;
        icon?: string;
    };
    deletable?: boolean;
    styles?: FlowElementStyle;
}

export const FlowElement = {
    isFlowElement
};
