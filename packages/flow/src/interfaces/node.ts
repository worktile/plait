import { FlowElement, FlowPosition } from './element';
export interface FlowHandle {
    id: string;
    position: FlowPosition;
    offsetX?: number;
    offsetY?: number;
}

export interface FlowNode<T = unknown> extends FlowElement<T> {
    width: number;
    height: number;
    handles?: FlowHandle[];
}
