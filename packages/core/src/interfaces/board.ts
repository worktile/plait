import { PlaitPointerType } from './pointer';
import { ComponentType, PlaitElement } from './element';
import { PlaitPluginElementContext } from '../core/element/context';
import { PlaitHistory } from './history';
import { PlaitOperation } from './operation';
import { Selection, Range } from './selection';
import { Viewport } from './viewport';
import { PlaitPluginElementComponent } from '../core/element/plugin-element';
import {
    BOARD_TO_COMPONENT,
    BOARD_TO_ELEMENT_HOST,
    BOARD_TO_HOST,
    BOARD_TO_MOVING_POINT,
    BOARD_TO_MOVING_POINT_IN_BOARD,
    BOARD_TO_ROUGH_SVG,
    IS_BOARD_CACHE,
    IS_TEXT_EDITABLE,
    NODE_TO_INDEX,
    NODE_TO_PARENT
} from '../utils/weak-maps';
import { RoughSVG } from 'roughjs/bin/svg';
import { BoardComponentInterface } from '../board/board.component.interface';
import { Point } from './point';
import { RectangleClient } from './rectangle-client';
import { getRectangleByElements } from '../utils/element';
import { PathRef, PathRefOptions } from './path-ref';
import { Ancestor, PlaitNode } from './node';
import { Path } from './path';
import { PlaitTheme, ThemeColor, ThemeColors } from './theme';
import { distanceBetweenPointAndRectangle } from '../utils/math';

export interface PlaitBoard {
    viewport: Viewport;
    children: PlaitElement[];
    theme: PlaitTheme;
    operations: PlaitOperation[];
    // record pointer selection or drag selection
    // it will be dirty when board viewport change
    selection: Selection | null;
    pointer: PlaitPointerType | string;
    history: PlaitHistory;
    options: PlaitBoardOptions;
    undo: () => void;
    redo: () => void;
    apply: (operation: PlaitOperation) => void;
    onChange: () => void;
    mousedown: (event: MouseEvent) => void;
    mousemove: (event: MouseEvent) => void;
    mouseleave: (event: MouseEvent) => void;
    mouseup: (event: MouseEvent) => void;
    globalMousemove: (event: MouseEvent) => void;
    globalMouseup: (event: MouseEvent) => void;
    keydown: (event: KeyboardEvent) => void;
    globalKeydown: (event: KeyboardEvent) => void;
    keyup: (event: KeyboardEvent) => void;
    setFragment: (data: DataTransfer | null, rectangle: RectangleClient | null) => void;
    insertFragment: (data: DataTransfer | null, targetPoint: Point) => void;
    deleteFragment: (data: DataTransfer | null) => void;
    dblclick: (event: MouseEvent) => void;
    drawElement: (context: PlaitPluginElementContext) => SVGGElement[] | ComponentType<PlaitPluginElementComponent>;
    redrawElement: (context: PlaitPluginElementContext, previousContext?: PlaitPluginElementContext) => SVGGElement[] | void;
    destroyElement: (context: PlaitPluginElementContext) => void;
    isHitSelection: (element: PlaitElement, range: Range) => boolean;
    isRecursion: (element: PlaitElement) => boolean;
    isMovable: (element: PlaitElement) => boolean;
    getRectangle: (element: PlaitElement) => RectangleClient | null;
    isWithinSelection: (element: PlaitElement) => boolean;
    pathRef: (path: Path, options?: PathRefOptions) => PathRef;
    pathRefs: () => Set<PathRef>;
    applyTheme: (element: PlaitElement) => void;

    // pointer hook
    pointerDown: (pointer: PointerEvent) => void;
    pointerMove: (pointer: PointerEvent) => void;
    pointerUp: (pointer: PointerEvent) => void;
    pointerCancel: (pointer: PointerEvent) => void;
    pointerOut: (pointer: PointerEvent) => void;
    pointerLeave: (pointer: PointerEvent) => void;
    globalPointerMove: (pointer: PointerEvent) => void;
    globalPointerUp: (pointer: PointerEvent) => void;
}

export interface PlaitBoardChangeEvent {
    children: PlaitElement[];
    operations: PlaitOperation[];
    viewport: Viewport;
    selection: Selection | null;
    theme: PlaitTheme;
}

export interface PlaitBoardOptions {
    readonly?: boolean;
    hideScrollbar?: boolean;
    disabledScrollOnNonFocus?: boolean;
    themeColors?: ThemeColor[];
}

export interface PlaitBoardMove {
    x: number;
    y: number;
}

export const PlaitBoard = {
    isBoard(value: any): value is PlaitBoard {
        const cachedIsBoard = IS_BOARD_CACHE.get(value);
        if (cachedIsBoard !== undefined) {
            return cachedIsBoard;
        }
        const isBoard = typeof value.onChange === 'function' && typeof value.apply === 'function';
        IS_BOARD_CACHE.set(value, isBoard);
        return isBoard;
    },
    findPath(board: PlaitBoard, node: PlaitNode): Path {
        const path: Path = [];
        let child: Ancestor = node;
        while (true) {
            const parent = NODE_TO_PARENT.get(child as PlaitElement);
            if (parent == null) {
                if (PlaitBoard.isBoard(child)) {
                    return path;
                } else {
                    break;
                }
            }
            const i = NODE_TO_INDEX.get(child as PlaitElement);
            if (i == null) {
                break;
            }
            path.unshift(i);
            child = parent;
        }
        throw new Error(`Unable to find the path for Plait node: ${JSON.stringify(node)}`);
    },
    getHost(board: PlaitBoard) {
        return BOARD_TO_HOST.get(board) as SVGSVGElement;
    },
    getElementHost(board: PlaitBoard) {
        return BOARD_TO_ELEMENT_HOST.get(board)?.host as SVGSVGElement;
    },
    getElementHostUp(board: PlaitBoard) {
        return BOARD_TO_ELEMENT_HOST.get(board)?.hostUp as SVGSVGElement;
    },
    getElementHostActive(board: PlaitBoard) {
        return BOARD_TO_ELEMENT_HOST.get(board)?.hostActive as SVGSVGElement;
    },
    getRoughSVG(board: PlaitBoard) {
        return BOARD_TO_ROUGH_SVG.get(board) as RoughSVG;
    },
    getComponent(board: PlaitBoard) {
        return BOARD_TO_COMPONENT.get(board) as BoardComponentInterface;
    },
    getBoardContainer(board: PlaitBoard) {
        return PlaitBoard.getComponent(board).nativeElement;
    },
    getRectangle(board: PlaitBoard) {
        return getRectangleByElements(board, board.children, true);
    },
    getViewportContainer(board: PlaitBoard) {
        return PlaitBoard.getHost(board).parentElement as HTMLElement;
    },
    isFocus(board: PlaitBoard) {
        return !!board.selection;
    },
    isReadonly(board: PlaitBoard) {
        return board.options.readonly;
    },
    hasBeenTextEditing(board: PlaitBoard) {
        return !!IS_TEXT_EDITABLE.get(board);
    },
    getPointer<T = PlaitPointerType>(board: PlaitBoard) {
        return board.pointer as T;
    },
    isPointer<T = PlaitPointerType>(board: PlaitBoard, pointer: T) {
        return board.pointer === pointer;
    },
    isInPointer<T = PlaitPointerType>(board: PlaitBoard, pointers: T[]) {
        const point = board.pointer as T;
        return pointers.includes(point);
    },
    getMovingPointInBoard(board: PlaitBoard) {
        return BOARD_TO_MOVING_POINT_IN_BOARD.get(board);
    },
    isMovingPointInBoard(board: PlaitBoard) {
        const point = BOARD_TO_MOVING_POINT.get(board);
        const rect = PlaitBoard.getBoardContainer(board).getBoundingClientRect();
        if (point && distanceBetweenPointAndRectangle(point[0], point[1], rect) === 0) {
            return true;
        }
        return false;
    },
    getThemeColors<T extends ThemeColor = ThemeColor>(board: PlaitBoard) {
        return (board.options.themeColors || ThemeColors) as T[];
    }
};
