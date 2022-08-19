import { MindmapElement } from './element';

export interface MindmapNode {
    depth: number;
    x: number;
    y: number;
    width: number;
    height: number;
    hgap: number;
    vgap: number;
    children: MindmapNode[];
    origin: MindmapElement;
    parent: MindmapNode;
    left: boolean;
    up: boolean;
}
