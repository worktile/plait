import { PlaitPointerType } from './pointer';
import { ComponentType, PlaitElement } from './element';
import { PlaitPluginElementContext } from '../core/element/context';
import { PlaitHistory } from './history';
import { PlaitOperation } from './operation';
import { Selection } from './selection';
import { Viewport } from './viewport';
import {
    BOARD_TO_CONTEXT,
    BOARD_TO_ELEMENT_HOST,
    BOARD_TO_HOST,
    BOARD_TO_MOVING_POINT,
    BOARD_TO_MOVING_POINT_IN_BOARD,
    BOARD_TO_ROUGH_SVG,
    IS_BOARD_ALIVE,
    IS_BOARD_CACHE,
    IS_TEXT_EDITABLE,
    NODE_TO_INDEX,
    NODE_TO_PARENT
} from '../utils/weak-maps';
import { RoughSVG } from 'roughjs/bin/svg';
import { Point } from './point';
import { RectangleClient } from './rectangle-client';
import { getRectangleByElements } from '../utils/element';
import { PathRef, PathRefOptions } from './path-ref';
import { Ancestor, PlaitNode } from './node';
import { Path } from './path';
import { PlaitTheme, ThemeColor, ThemeColors } from './theme';
import { distanceBetweenPointAndRectangle } from '../utils/math';
import { ClipboardData, WritableClipboardContext, WritableClipboardOperationType } from '../utils';
import { ElementFlavour } from '../core/element/element-flavour';
import { PlaitBoardContext } from '../context';

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
    afterChange: () => void;
    drawActiveRectangle: () => SVGGElement | null;
    mousedown: (event: MouseEvent) => void;
    mousemove: (event: MouseEvent) => void;
    mouseleave: (event: MouseEvent) => void;
    mouseup: (event: MouseEvent) => void;
    globalMousemove: (event: MouseEvent) => void;
    globalMouseup: (event: MouseEvent) => void;
    keyDown: (event: KeyboardEvent) => void;
    globalKeyDown: (event: KeyboardEvent) => void;
    keyUp: (event: KeyboardEvent) => void;
    buildFragment: (
        clipboardContext: WritableClipboardContext | null,
        rectangle: RectangleClient | null,
        operationType: WritableClipboardOperationType,
        originData?: PlaitElement[]
    ) => WritableClipboardContext | null;
    insertFragment: (clipboardData: ClipboardData | null, targetPoint: Point, operationType?: WritableClipboardOperationType) => void;
    deleteFragment: (data: PlaitElement[]) => void;
    getDeletedFragment: (data: PlaitElement[]) => PlaitElement[];
    getRelatedFragment: (data: PlaitElement[], originData?: PlaitElement[]) => PlaitElement[];
    dblClick: (event: MouseEvent) => void;
    drawElement: (context: PlaitPluginElementContext) => ComponentType<ElementFlavour>;
    isRectangleHit: (element: PlaitElement, range: Selection) => boolean;
    // When the element has no fill color, it is considered a hit only if it hits the border.
    isHit: (element: PlaitElement, point: Point) => boolean;
    isInsidePoint: (element: PlaitElement, point: Point) => boolean;
    isRecursion: (element: PlaitElement) => boolean;
    isMovable: (element: PlaitElement) => boolean;
    getRectangle: (element: PlaitElement) => RectangleClient | null;
    isWithinSelection: (element: PlaitElement) => boolean;
    pathRef: (path: Path, options?: PathRefOptions) => PathRef;
    pathRefs: () => Set<PathRef>;
    applyTheme: (element: PlaitElement) => void;
    isAlign: (element: PlaitElement) => boolean;
    isImageBindingAllowed: (element: PlaitElement) => boolean;
    canAddToGroup: (element: PlaitElement) => boolean;
    canSetZIndex: (element: PlaitElement) => boolean;
    isExpanded: (element: PlaitElement) => boolean;
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
    isAlive(board: PlaitBoard) {
        const isAlive = IS_BOARD_ALIVE.get(board);
        return !!isAlive;
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
    getElementLowerHost(board: PlaitBoard) {
        return BOARD_TO_ELEMENT_HOST.get(board)?.lowerHost as SVGSVGElement;
    },
    getElementHost(board: PlaitBoard) {
        return BOARD_TO_ELEMENT_HOST.get(board)?.host as SVGSVGElement;
    },
    getElementUpperHost(board: PlaitBoard) {
        return BOARD_TO_ELEMENT_HOST.get(board)?.upperHost as SVGSVGElement;
    },
    getElementActiveHost(board: PlaitBoard) {
        return BOARD_TO_ELEMENT_HOST.get(board)?.activeHost as SVGSVGElement;
    },
    getRoughSVG(board: PlaitBoard) {
        return BOARD_TO_ROUGH_SVG.get(board) as RoughSVG;
    },
    getBoardContainer(board: PlaitBoard) {
        return BOARD_TO_ELEMENT_HOST.get(board)?.container as HTMLElement;
    },
    getBoardContext(board: PlaitBoard) {
        return BOARD_TO_CONTEXT.get(board) as PlaitBoardContext;
    },
    getRectangle(board: PlaitBoard) {
        return getRectangleByElements(board, board.children, true);
    },
    getViewportContainer(board: PlaitBoard) {
        return BOARD_TO_ELEMENT_HOST.get(board)?.viewportContainer as HTMLElement;
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
