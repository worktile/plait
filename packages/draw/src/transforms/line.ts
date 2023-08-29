import { Path, PlaitBoard, Transforms } from '@plait/core';
import { PlaitLine } from '../interfaces';

export const resizeLine = (board: PlaitBoard, options: Partial<PlaitLine>, path: Path) => {
    Transforms.setNode(board, options, path);
};
