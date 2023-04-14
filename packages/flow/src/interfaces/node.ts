import { FlowElement, FlowElementType, FlowHandle } from './element';
import { PlaitElement } from '@plait/core';

export const isFlowNodeElement = <T>(value: PlaitElement): value is FlowNode<T> => {
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
