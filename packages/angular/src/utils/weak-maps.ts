import { PlaitBoard } from '@plait/core';
import { BoardComponentInterface } from '../board/board.component.interface';

export const BOARD_TO_COMPONENT = new WeakMap<PlaitBoard, BoardComponentInterface>();
