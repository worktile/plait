import { LayoutNode, ConnectingPosition } from './layout-node';

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
    rootLayoutType: MindLayoutType;
}

export interface OriginNode {
    children: OriginNode[];
    isCollapsed?: boolean;
    layout?: string;
    rightNodeCount: number;
}

export interface AbstractNode extends OriginNode {
    start: number;
    end: number;
}

export const AbstractNode = {
    isAbstract(value: any): value is AbstractNode {
        if (typeof value.start === 'number' && typeof value.end === 'number') {
            return true;
        } else {
            return false;
        }
    }
};

export enum MindLayoutType {
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
