import { PlaitElement } from '@plait/core';
import { MindmapElement } from './element';
import { Element } from 'slate';
import { MindmapLayoutType } from '@plait/layouts';

export interface PlaitMindmap extends PlaitElement {
    id: string;
    value: Element;
    children: MindmapElement[];
    width: number;
    height: number;
    isRoot?: boolean;
    layout?: MindmapLayoutType;
}

export const isPlaitMindmap = (value: any): value is PlaitMindmap => {
    return value.type === 'mindmap';
};

export enum LayoutDirection {
    'top' = 'top',
    'right' = 'right',
    'bottom' = 'bottom',
    'left' = 'left'
}

export const LayoutDirectionsMap = {
    [MindmapLayoutType.right]: [LayoutDirection.right],
    [MindmapLayoutType.left]: [LayoutDirection.left],
    [MindmapLayoutType.upward]: [LayoutDirection.top],
    [MindmapLayoutType.downward]: [LayoutDirection.bottom],
    [MindmapLayoutType.rightBottomIndented]: [LayoutDirection.right, LayoutDirection.bottom],
    [MindmapLayoutType.rightTopIndented]: [LayoutDirection.right, LayoutDirection.top],
    [MindmapLayoutType.leftBottomIndented]: [LayoutDirection.left, LayoutDirection.bottom],
    [MindmapLayoutType.leftTopIndented]: [LayoutDirection.left, LayoutDirection.top]
};
