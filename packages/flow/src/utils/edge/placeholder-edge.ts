import { PlaitBoard } from '@plait/core';

export const addPlaceholderEdgeInfo = (board: PlaitBoard, placeholder: SVGElement) => {
    FLOW_PLACEHOLDER_EDGE_INFO.set(board, placeholder);
};

export const deletePlaceholderEdgeInfo = (board: PlaitBoard) => {
    FLOW_PLACEHOLDER_EDGE_INFO.delete(board);
};

export const isPlaceholderEdgeInfo = (board: PlaitBoard) => {
    return FLOW_PLACEHOLDER_EDGE_INFO.get(board);
};

export const FLOW_PLACEHOLDER_EDGE_INFO: WeakMap<PlaitBoard, SVGElement> = new WeakMap();
