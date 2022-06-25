import { SetViewportOperation } from '../interfaces/operation';
import { PlaitBoard } from '../interfaces/board';
import { Viewport } from '../interfaces/viewport';

export function setViewport(board: PlaitBoard, viewport: Viewport) {
    const operation: SetViewportOperation = { type: 'set_viewport', properties: board.viewport, newProperties: viewport };
    board.apply(operation);
}

export interface ViewportTransforms {
    setViewport: (board: PlaitBoard, viewport: Viewport) => void;
}

export const ViewportTransforms: ViewportTransforms = {
    setViewport
};
