export interface LayoutOptions {
    getHeight: (node: OriginNode) => number;
    getWidth: (node: OriginNode) => number;
    getHorizontalGap: (node: OriginNode) => number;
    getVerticalGap: (node: OriginNode) => number;
}

export interface OriginNode {
    children: OriginNode[];
    isCollapsed?: boolean;
    layout?: string;
}

export enum LayoutType {
    'logic' = 'logic',
    'indented' = 'indented'
}
