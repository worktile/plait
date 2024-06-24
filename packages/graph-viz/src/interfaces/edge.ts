export interface KnowledgeGraphEdge {
    source: string;
    target: string;
}

export enum KnowledgeGraphEdgeDirection {
    IN,
    OUT,
    NONE
}
