export interface LayoutOptions {
    getHeight: (node: OriginNode) => number;
    getWidth: (node: OriginNode) => number;
    getHorizontalGap: (node: OriginNode) => number;
    getVerticalGap: (node: OriginNode) => number;
}

export interface LayoutContext {
    toLeft: boolean;
    toTop: boolean;
    isHorizontal: boolean;
}

export interface OriginNode {
    children: OriginNode[];
    isCollapsed?: boolean;
    layout?: string;
}

export enum MindmapLayoutType {
    'right' = 'right',
    'left' = 'left',
    'standard' = 'standard',
    'upward' = 'upward',
    'downward' = 'downward',
    'rightBottomIndented' = 'right-bottom-indented',
    'rightTopIndented' = 'right-top-indented',
    'leftTopIndented' = 'left-top-indented',
    'leftBottomIndented' = 'left-bottom-indented'
}

export enum LayoutType {
    'logic' = 'logic',
    'indented' = 'indented',
    'fishBone' = 'fish-bone'
}
