import { FlowBaseData, FlowElement, FlowElementType, FlowHandle, FlowPosition } from './element';
import { PlaitElement } from '@plait/core';
import { FlowNode } from './node';

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

export function isFlowEdgeElement(value: PlaitElement): value is FlowEdge {
    return value.type === FlowElementType.edge;
}

export const hasIcon = <T extends FlowBaseData>(value: PlaitElement): value is FlowElement<T> => {
    return value.data.icon;
};

export const FlowEdge = {
    isFlowEdgeElement,
    hasIcon
};
