import { PlaitElement } from '@plait/core';
import { MindmapElement } from './element';
import { Element } from 'slate';

export interface PlaitMindmap extends PlaitElement {
    id: string;
    value: Element;
    children: MindmapElement[];
    width: number;
    height: number;
    isRoot?: boolean;
    layout?: MindmapLayout;
}

export const isPlaitMindmap = (value: any): value is PlaitMindmap => {
    return value.type === 'mindmap';
};

export enum MindmapLayout {
    'right' = 'right',
    'left' = 'left',
    'standard' = 'standard',
    'upward' = 'upward',
    'downward' = 'downward',
    'indented' = 'indented'
}
