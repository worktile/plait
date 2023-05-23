import { MindLayoutType } from '@plait/layouts';
import { Path } from '@plait/core';
import { MindElement } from './element';

export interface MindNode {
    depth: number;
    x: number;
    y: number;
    width: number;
    height: number;
    hGap: number;
    vGap: number;
    children: MindNode[];
    origin: MindElement;
    parent: MindNode;
    left: boolean;
    up: boolean;
}

export const MindNode = {
    get(root: MindNode, path: Path) {
        let node = root;
        for (let i = 0; i < path.length; i++) {
            const p = path[i];
            if (!node || !node.children || !node.children[p]) {
                throw new Error(`Cannot find a descendant at path [${path}]`);
            }
            node = node.children[p];
        }
        return node;
    }
};

// mind node extend 支持的布局类型
export type ExtendLayoutType = Exclude<MindLayoutType, MindLayoutType.standard>;

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
