import { FlowBaseData, FlowElement, FlowElementType, FlowPosition } from './element';
import { PlaitElement } from '@plait/core';

export const isFlowNodeElement = <T extends FlowBaseData>(value: PlaitElement): value is FlowNode<T> => {
    return FlowElementType.node === value.type;
};

export interface FlowNodeHandle {
    id: string;
    position: FlowPosition;
    offsetX?: number;
    offsetY?: number;
}

export interface FlowNode<T extends FlowBaseData = FlowBaseData> extends FlowElement<T> {
    width: number;
    height: number;
    handles?: FlowNodeHandle[];
}

export const FlowNode = {
    isFlowNodeElement
};
