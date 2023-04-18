import { LayoutNode, ConnectingPosition } from './interfaces/layout-node';

export interface LayoutOptions {
    getHeight: (node: OriginNode) => number;
    getWidth: (node: OriginNode) => number;
    getHorizontalGap: (node: OriginNode, parent?: LayoutNode) => number;
    getVerticalGap: (node: OriginNode, parent?: LayoutNode) => number;
    getVerticalConnectingPosition: (node: OriginNode, parent?: LayoutNode) => ConnectingPosition;
    getExtendWidth?: (node: OriginNode) => number;
    getExtendHeight: (node: OriginNode) => number;
    getIndentedCrossLevelGap: () => number;
}

export interface LayoutContext {
    toLeft: boolean;
    toTop: boolean;
    rootLayoutType: MindmapLayoutType;
}

export interface OriginNode {
    children: OriginNode[];
    isCollapsed?: boolean;
    isAbstract?: boolean;
    start?: number;
    end?: number;
    id?: string;
    layout?: string;
    rightNodeCount: number;
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
