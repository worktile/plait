import { Options } from 'roughjs/bin/core';
import { DEFAULT_STYLES } from './default';
import { KnowledgeGraphEdgeDirection } from '../interfaces';

export const DEFAULT_KNOWLEDGE_GRAPH_EDGE_STYLES: Options = {
    ...DEFAULT_STYLES,
    stroke: '#ccc'
};

export const DEFAULT_KNOWLEDGE_GRAPH_LINE_STYLES = {
    color: {
        [KnowledgeGraphEdgeDirection.IN]: 'green',
        [KnowledgeGraphEdgeDirection.OUT]: '#6698FF',
        [KnowledgeGraphEdgeDirection.NONE]: '#ccc'
    }
};
