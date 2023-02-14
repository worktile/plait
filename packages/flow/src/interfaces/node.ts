import { FlowElement, FlowPosition } from './element';

export interface FlowHandle {
    id: string;
    position: FlowPosition;
    offsetX?: number;
    offsetY?: number;
}

export interface FlowNode extends FlowElement {
    width: number;
    height: number;
    handles?: FlowHandle[];
    [key: string]: any;
}
