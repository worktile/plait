import { GeneratorExtraData } from '@plait/common';
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

export interface EdgeGeneratorData extends GeneratorExtraData {
    startPoint: Point;
    endPoint: Point;
    isSourceActive: boolean;
    isTargetActive: boolean;
    direction: EdgeDirection;
}

export interface NodeGeneratorData extends GeneratorExtraData {
    isActive: boolean;
    isFirstDepth: boolean;
}

export interface NodeIconItem {
    name: string;
    fontSize?: number;
    color?: string;
}
