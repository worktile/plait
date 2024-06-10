import { RoughSVG } from 'roughjs/bin/svg';
import { PlaitElement } from '../interfaces/element';
import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { Ancestor, PlaitNode } from '../interfaces/node';
import { PathRef } from '../interfaces/path-ref';
import { PlaitElementRef } from '../core/element/element-ref';
import { PlaitBoardContext } from '../context';

// record richtext type status
export const IS_BOARD_CACHE = new WeakMap<Object, boolean>();

export const FLUSHING = new WeakMap<PlaitBoard, boolean>();

export const NODE_TO_INDEX = new WeakMap<PlaitNode, number>();

export const NODE_TO_PARENT = new WeakMap<PlaitNode, Ancestor>();

export const NODE_TO_G = new WeakMap<PlaitNode, SVGGElement>();

export const NODE_TO_CONTAINER_G = new WeakMap<PlaitNode, SVGGElement>();

export const IS_TEXT_EDITABLE = new WeakMap<PlaitBoard, boolean>();

export const BOARD_TO_ON_CHANGE = new WeakMap<PlaitBoard, () => void>();

export const BOARD_TO_AFTER_CHANGE = new WeakMap<PlaitBoard, () => void>();

export const BOARD_TO_ROUGH_SVG = new WeakMap<PlaitBoard, RoughSVG>();

export const BOARD_TO_HOST = new WeakMap<PlaitBoard, SVGSVGElement>();

export const BOARD_TO_CONTEXT = new WeakMap<PlaitBoard, PlaitBoardContext>();

export const IS_BOARD_ALIVE = new WeakMap<PlaitBoard, boolean>();

export const BOARD_TO_ELEMENT_HOST = new WeakMap<
    PlaitBoard,
    {
        lowerHost: SVGGElement;
        host: SVGGElement;
        upperHost: SVGGElement;
        activeHost: SVGGElement;
        container: HTMLElement;
        viewportContainer: HTMLElement;
    }
>();

export const BOARD_TO_SELECTED_ELEMENT = new WeakMap<PlaitBoard, PlaitElement[]>();

export const BOARD_TO_MOVING_POINT_IN_BOARD = new WeakMap<PlaitBoard, Point>();

export const BOARD_TO_MOVING_POINT = new WeakMap<PlaitBoard, Point>();

export const BOARD_TO_VIEWPORT_ORIGINATION = new WeakMap<PlaitBoard, Point>();

export const BOARD_TO_IS_SELECTION_MOVING = new WeakMap<PlaitBoard, boolean>();

// save no standard selected elements
export const BOARD_TO_TEMPORARY_ELEMENTS = new WeakMap<PlaitBoard, { elements: PlaitElement[]; timeoutId: any }>();

export const BOARD_TO_MOVING_ELEMENT = new WeakMap<PlaitBoard, PlaitElement[]>();

export const PATH_REFS: WeakMap<PlaitBoard, Set<PathRef>> = new WeakMap();

export const ELEMENT_TO_REF: WeakMap<PlaitElement, PlaitElementRef> = new WeakMap();
