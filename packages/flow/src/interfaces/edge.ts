import { Direction } from '@plait/core';
import { FlowBaseData, FlowElement, FlowElementType, FlowHandle } from './element';
import { FlowNode } from './node';

export type FlowEdgeMarkerType = 'arrow' | 'none';

export type FlowEdgeHandleType = 'source' | 'target';

export enum FlowEdgeShape {
    straight = 'straight',
    curve = 'curve',
    elbow = 'elbow'
}

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
    position: Direction;
    // handleId?: string;
    marker?: FlowEdgeMarkerType;
}

export interface FlowEdge<T extends FlowBaseData = FlowBaseData> extends FlowElement<T> {
    target: FlowEdgeHandle;
    source?: FlowEdgeHandle;
    shape?: FlowEdgeShape;
}

export function isFlowEdgeElement(value: FlowElement): value is FlowEdge {
    return value.type === FlowElementType.edge;
}

export const hasIcon = (value: FlowEdge) => {
    return value.data?.icon;
};

export const FlowEdge = {
    isFlowEdgeElement,
    hasIcon
};
