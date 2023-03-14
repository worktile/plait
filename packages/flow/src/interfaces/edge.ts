import { FlowElement, FlowElementType, FlowPosition } from './element';
import { PlaitElement } from '@plait/core';

export const isFlowEdgeElement = (value: PlaitElement): value is FlowElement => {
    return value.type === FlowElementType.edge;
};

export type FlowEdgeMarkerType = 'arrow' | 'none';

export interface FlowEdge<T = unknown> extends FlowElement<T> {
    source?: {
        id: string;
        position: FlowPosition;
        handleId?: string;
        marker?: FlowEdgeMarkerType;
    };
    target: {
        id: string;
        position: FlowPosition;
        handleId?: string;
        marker?: FlowEdgeMarkerType;
    };
}

export const FlowEdge = {
    isFlowEdgeElement
};
