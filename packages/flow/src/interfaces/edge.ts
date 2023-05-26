import { FlowBaseData, FlowElement, FlowElementType, FlowHandle, FlowPosition } from './element';
import { PlaitElement } from '@plait/core';
import { FlowNode } from './node';

export function isFlowEdgeElement(value: PlaitElement): value is FlowEdge {
    return value.type === FlowElementType.edge;
}

export type FlowEdgeMarkerType = 'arrow' | 'none';

export type FlowEdgeHandleType = 'source' | 'target';

export interface FlowEdgeHandleRef extends FlowHandle {
    node: FlowNode;
    type?: FlowEdgeHandleType;
}

export interface FlowEdgeDragInfo {
    offsetX: number;
    offsetY: number;
    handleType: FlowEdgeHandleType;
}

export interface FlowEdgeHandle {
    nodeId: string;
    position: FlowPosition;
    // handleId?: string;
    marker?: FlowEdgeMarkerType;
}

export interface FlowEdge<T extends FlowBaseData = FlowBaseData> extends FlowElement<T> {
    source?: FlowEdgeHandle;
    target: FlowEdgeHandle;
}

export const FlowEdge = {
    isFlowEdgeElement
};
