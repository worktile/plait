import { Point } from '@plait/core';

export interface KnowledgeGraphNodeStyles {
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    fillStyle?: string;
    activeStroke?: string;
    activeFill?: string;
    borderRadius?: number;
    hoverStroke?: string;
}

export interface KnowledgeGraphNode {
    id: string;
    label?: string;
    icon?: string;
    isMain?: boolean;
    width?: number;
    height?: number;
    size?: number;
    styles?: KnowledgeGraphNodeStyles;
}
