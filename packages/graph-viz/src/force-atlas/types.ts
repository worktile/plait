import { Point } from '@plait/core';

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
    startPoint: Point;
    endPoint: Point;
    isSourceActive: boolean;
    isTargetActive: boolean;
    direction: EdgeDirection;
}
