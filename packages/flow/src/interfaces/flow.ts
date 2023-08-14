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

export enum FlowRenderMode {
    default = 'default',
    active = 'active',
    hover = 'hover'
}
