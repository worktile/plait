export enum FlowPluginKey {
    'flowOptions' = 'flowOptions'
}

export interface FlowPluginOptions {
    edgeLabelOptions: EdgeLabelOptions;
}

export interface EdgeLabelOptions {
    height?: number;
    maxWidth?: number;
}

export enum EdgeState {
    'active' = 'active',
    'highlight' = 'highlight',
    'hovering' = 'hovering',
    '' = ''
}

export type NodeState = EdgeState;
