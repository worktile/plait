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
    rightNodeCount: number;
}

export const isPlaitMindmap = (value: any): value is PlaitMindmap => {
    return value.type === 'mindmap';
};

