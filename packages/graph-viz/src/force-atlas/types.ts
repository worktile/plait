import { Point } from '@plait/core';

export interface Node {
    id: string;
    label?: string;
    icon?: string;
    isActive?: boolean;
    width?: number;
    height?: number;
    size?: number;
    styles?: NodeStyles;
}

export interface Edge {
    source: string;
    target: string;
}

export type Positions = { [id: string]: Point };

export enum EdgeDirection {
    IN,
    OUT,
    NONE
}

export interface NodeStyles {
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    fillStyle?: string;
    activeStroke?: string;
    activeFill?: string;
    borderRadius?: number;
    hoverStroke?: string;
}

export interface EdgeInfo {
    isSourceActive: boolean;
    isTargetActive: boolean;
}
