import { KnowledgeGraphNode } from './node';
import { KnowledgeGraphEdge } from './edge';
import { PlaitElement, Point } from '@plait/core';

export interface KnowledgeGraphBaseData {
    text?: Element;
    icon?: string;
}

export interface KnowledgeGraphElement extends PlaitElement {
    id: string;
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
}

export type KnowledgeGraphPositions = { [id: string]: Point };
