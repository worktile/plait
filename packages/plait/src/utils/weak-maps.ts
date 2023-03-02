import { RoughSVG } from 'roughjs/bin/svg';
import { BoardComponentInterface } from '../board/board.component.interface';
import { PlaitBoard } from '../interfaces/board';

// record richtext type status
export const FLUSHING: WeakMap<PlaitBoard, boolean> = new WeakMap();

export const IS_TEXT_EDITABLE = new WeakMap<PlaitBoard, boolean>();

export const BOARD_TO_ON_CHANGE = new WeakMap<PlaitBoard, () => void>();

export const HOST_TO_ROUGH_SVG = new WeakMap<SVGElement, RoughSVG>();

export const PLAIT_BOARD_TO_COMPONENT = new WeakMap<PlaitBoard, BoardComponentInterface>();