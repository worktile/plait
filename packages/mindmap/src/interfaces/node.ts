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
