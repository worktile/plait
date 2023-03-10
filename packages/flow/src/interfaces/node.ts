import { Options } from 'roughjs/bin/core';
import { FlowElement, FlowElementType, FlowPosition } from './element';
import { PlaitElement } from '@plait/core';

export const isFlowNodeElement = (value: PlaitElement): value is FlowNode => {
    return value.type === FlowElementType.node;
};
export interface FlowHandle {
    position: FlowPosition;
    id?: string;
    offsetX?: number;
    offsetY?: number;
}

export interface FlowNode extends FlowElement {
    width: number;
    height: number;
    handles?: FlowHandle[];
    options?: Options;
    [key: string]: any;
}
