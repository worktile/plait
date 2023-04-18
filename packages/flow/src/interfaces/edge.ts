import { FlowBaseData, FlowElement, FlowElementType, FlowHandle, FlowPosition } from './element';
import { PlaitElement } from '@plait/core';
import { FlowNode } from './node';

export function isFlowEdgeElement<T extends FlowBaseData>(value: PlaitElement): value is FlowEdge<T> {
    return value.type === FlowElementType.edge;
}

export type FlowEdgeMarkerType = 'arrow' | 'none';

export type FlowEdgeHandleType = 'source' | 'target';

export interface FlowEdgeHandle extends FlowHandle {
    node: FlowNode;
    type?: FlowEdgeHandleType;
}

export interface FlowEdgeDragInfo {
    offsetX: number;
    offsetY: number;
    handleType: FlowEdgeHandleType;
}

export interface FlowEdgeInfo {
    id: string;
    position: FlowPosition;
    handleId?: string;
    marker?: FlowEdgeMarkerType;
}

export interface FlowEdge<T extends FlowBaseData = FlowBaseData> extends FlowElement<T> {
    source?: FlowEdgeInfo;
    target: FlowEdgeInfo;
}

export const FlowEdge = {
    isFlowEdgeElement
};
