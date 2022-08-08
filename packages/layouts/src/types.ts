export interface LayoutOptions {
    getHeight: (node: OriginNode) => number;
    getWidth: (node: OriginNode) => number;
    getHGap: (node: OriginNode) => number;
    getVGap: (node: OriginNode) => number;
}

export interface OriginNode {
    children: OriginNode[];
    isCollapsed?: boolean;
}
