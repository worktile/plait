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
