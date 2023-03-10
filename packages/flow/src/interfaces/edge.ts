import { FlowElement, FlowElementType, FlowPosition } from './element';
import { PlaitElement } from '@plait/core';

export const isFlowEdgeElement = (value: PlaitElement): value is FlowElement => {
    return value.type === FlowElementType.edge;
};

export interface FlowEdge extends FlowElement {
    source?: {
        id: string;
        position: FlowPosition;
        handleId?: string;
    };
    target: {
        id: string;
        position: FlowPosition;
        handleId?: string;
    };
    [key: string]: any;
}

export interface FlowXYPosition {
    x: number;
    y: number;
}

export interface FlowDimensions {
    width: number;
    height: number;
}

export interface FlowRect extends FlowDimensions, FlowXYPosition {}
