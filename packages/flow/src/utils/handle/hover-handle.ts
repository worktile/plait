import { PlaitBoard } from '@plait/core';
import { HitNodeHandle } from './node';

export const addHoverHandleInfo = (board: PlaitBoard, handle: HitNodeHandle | null) => {
    FLOW_HOVER_HANDLE_INFO.set(board, handle);
};

export const deleteHoverHandleInfo = (board: PlaitBoard) => {
    FLOW_HOVER_HANDLE_INFO.delete(board);
};

export const getHoverHandleInfo = (board: PlaitBoard) => {
    return FLOW_HOVER_HANDLE_INFO.get(board);
};

export const FLOW_HOVER_HANDLE_INFO: WeakMap<PlaitBoard, HitNodeHandle | null> = new WeakMap();
