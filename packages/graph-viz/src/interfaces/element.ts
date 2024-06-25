import { PlaitElement, Point } from '@plait/core';
import { Node, Edge } from '../force-atlas/types';

export interface ForceAtlasElement extends PlaitElement {
    id: string;
    nodes: Node[];
    edges: Edge[];
}
