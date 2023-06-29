import { FlowBaseData, FlowElement, FlowElementType, FlowHandle } from './element';

export interface FlowNodeHandle extends FlowHandle {}

export interface FlowNode<T extends FlowBaseData = FlowBaseData> extends FlowElement<T> {
    width: number;
    height: number;
    handles?: FlowNodeHandle[];
}

export const isFlowNodeElement = <T extends FlowBaseData>(value: FlowElement): value is FlowNode<T> => {
    return FlowElementType.node === value.type;
};

export const FlowNode = {
    isFlowNodeElement
};
