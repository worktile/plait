import { FlowElement, FlowElementType, FlowHandle, FlowPosition } from './element';
import { PlaitElement } from '@plait/core';

export const isFlowNodeElement = (value: PlaitElement): value is FlowNode => {
    return FlowElementType.node === value.type;
};

export interface FlowNodeHandle extends FlowHandle {
    id: string;
}

export interface FlowNode<T = unknown> extends FlowElement<T> {
    width: number;
    height: number;
    handles?: FlowNodeHandle[];
}

export const FlowNode = {
    isFlowNodeElement
};
