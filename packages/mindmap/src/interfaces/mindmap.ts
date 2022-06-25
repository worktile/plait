import { PlaitElement } from 'plait';
import { MindmapElement } from './element';
import { Element } from 'slate';

export interface PlaitMindmap extends PlaitElement {
    id: string;
    value: Element;
    children: MindmapElement[];
    width: number;
    height: number;
    isRoot?: boolean;
}

export const isPlaitMindmap = (value: any): value is PlaitMindmap => {
    return value.type === 'mindmap';
};
