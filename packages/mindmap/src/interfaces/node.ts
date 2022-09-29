import { MindmapLayoutType } from '@plait/layouts';
import { MindmapElement } from './element';

export interface MindmapNode {
    depth: number;
    x: number;
    y: number;
    width: number;
    height: number;
    hGap: number;
    vGap: number;
    children: MindmapNode[];
    origin: MindmapElement;
    parent: MindmapNode;
    left: boolean;
    up: boolean;
}

export const MindmapNode = {
    isEquals(node: MindmapNode, otherNode: MindmapNode) {
        const hasSameSize =
            node.x === otherNode.x && node.y === otherNode.y && node.width === otherNode.width && node.height === otherNode.height;
        const hasSameOrigin = node.origin === otherNode.origin;
        let hasSameParent = false;
        if (node.parent && otherNode.parent) {
            hasSameParent = node.parent.origin.children.length === otherNode.parent.origin.children.length;
        }
        return hasSameSize && hasSameOrigin && hasSameParent;
    }
};

// mindmap node extend 支持的布局类型
export type ExtendLayoutType = Exclude<MindmapLayoutType, MindmapLayoutType.standard>;
export type CoordinateType = {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
};
export type ExtendUnderlineCoordinateType = {
    [key in ExtendLayoutType]: CoordinateType;
};

export type DetectResult = 'top' | 'bottom' | 'right' | 'left' | null;

export type RootBaseDirection = 'right' | 'left' | null;
