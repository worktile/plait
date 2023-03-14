import { FlowElement, FlowElementType, FlowHandle, FlowPosition } from './element';
import { PlaitElement, RectangleClient } from '@plait/core';

export const isFlowEdgeElement = (value: PlaitElement): value is FlowEdge => {
    return value.type === FlowElementType.edge;
};

export type FlowEdgeMarkerType = 'arrow' | 'none';

export type FlowEdgeHandleType = 'source' | 'target';

export interface FlowEdgeHandle extends FlowHandle {
    nodeRect: RectangleClient;
    source?: FlowEdgeHandleType;
}

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
