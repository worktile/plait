import { PlaitBoard, Transforms } from '@plait/core';
import { FlowEdge } from '../../interfaces/edge';
import { FlowBaseData } from '../../interfaces/element';

export function createFlowEdge<T extends FlowBaseData = FlowBaseData>(board: PlaitBoard, data: T, edge: FlowEdge) {
    Transforms.insertNode(
        board,
        {
            data,
            ...edge,
            point: []
        },
        [board.children.length - 1]
    );
}

export const addCreateEdgeInfo = (board: PlaitBoard, edge: FlowEdge) => {
    FLOW_CREATE_EDGE_INFO.set(board, edge);
};

export const deleteCreateEdgeInfo = (board: PlaitBoard) => {
    FLOW_CREATE_EDGE_INFO.delete(board);
};

export const getCreateEdgeInfo = (board: PlaitBoard) => {
    return FLOW_CREATE_EDGE_INFO.get(board);
};

export const FLOW_CREATE_EDGE_INFO: WeakMap<PlaitBoard, FlowEdge> = new WeakMap();
