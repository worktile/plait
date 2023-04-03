import { RoughSVG } from 'roughjs/bin/svg';
import { BoardComponentInterface } from '../board/board.component.interface';
import { PlaitElement } from '../interfaces/element';
import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';

// record richtext type status
export const FLUSHING: WeakMap<PlaitBoard, boolean> = new WeakMap();

export const IS_TEXT_EDITABLE = new WeakMap<PlaitBoard, boolean>();

export const BOARD_TO_ON_CHANGE = new WeakMap<PlaitBoard, () => void>();

export const BOARD_TO_COMPONENT = new WeakMap<PlaitBoard, BoardComponentInterface>();

export const BOARD_TO_ROUGH_SVG = new WeakMap<PlaitBoard, RoughSVG>();

export const BOARD_TO_HOST = new WeakMap<PlaitBoard, SVGSVGElement>();

export const BOARD_TO_ELEMENT_HOST = new WeakMap<PlaitBoard, SVGGElement>();

export const BOARD_TO_SELECTED_ELEMENT = new WeakMap<PlaitBoard, PlaitElement[]>();

export const BOARD_TO_MOVING_POINT = new WeakMap<PlaitBoard, Point>();

export const BOARD_TO_VIEWPORT_ORIGINATION = new WeakMap<PlaitBoard, Point>();

export const BOARD_TO_IS_SELECTION_MOVING = new WeakMap<PlaitBoard, boolean>();

// save no standard selected elements
export const BOARD_TO_TEMPORARY_ELEMENTS = new WeakMap<PlaitBoard, PlaitElement[]>();

export const BOARD_TO_MOVING_ELEMENT = new WeakMap<PlaitBoard, PlaitElement[]>();

export const BOARD_TO_SCROLLING = new WeakMap<PlaitBoard, boolean>()
