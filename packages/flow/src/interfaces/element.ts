import { Direction, PlaitElement } from '@plait/core';
import { Element } from 'slate';

export enum FlowElementType {
    node = 'node',
    edge = 'edge'
}

export interface FlowHandle {
    position: Direction;
    offsetX?: number;
    offsetY?: number;
}

export interface FlowElementStyles {
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    fillStyle?: string;
    activeStroke?: string;
    activeFill?: string;
    borderRadius?: number;
    hoverStroke?: string;
}

export interface FlowBaseData {
    text?: Element;
    icon?: string;
}

export interface FlowElement<T extends FlowBaseData = FlowBaseData> extends PlaitElement {
    id: string;
    type: FlowElementType;
    data?: T;
    undeletable?: boolean;
    styles?: FlowElementStyles;
}

export const isFlowElement = <T extends FlowBaseData>(value: PlaitElement): value is FlowElement<T> => {
    return [FlowElementType.node, FlowElementType.edge].includes(value.type as FlowElementType);
};

export const FlowElement = {
    isFlowElement
};
