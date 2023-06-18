import { ThemeColorMode } from '../interfaces/theme';
import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { PlaitPointerType } from '../interfaces/pointer';
import { toPoint } from '../utils/dom/common';
import { getRectangleByElements } from '../utils/element';
import { distanceBetweenPointAndRectangle } from '../utils/math';
import { clampZoomLevel, clearViewportOrigination, getViewBox, getViewportOrigination } from '../utils/viewport';
import { BOARD_TO_COMPONENT } from '../utils/weak-maps';
import { setViewport } from './viewport';
import { depthFirstRecursion } from '../utils';
import { PlaitElement } from '../interfaces/element';
import { setTheme } from './theme';

function updateViewport(board: PlaitBoard, origination: Point, zoom?: number) {
    zoom = zoom ?? board.viewport.zoom;
    setViewport(board, {
        ...board.viewport,
        zoom,
        origination
    });
    clearViewportOrigination(board);
}

const updatePointerType = <T extends string = PlaitPointerType>(board: PlaitBoard, pointer: T) => {
    board.pointer = pointer;
    const boardComponent = BOARD_TO_COMPONENT.get(board);
    boardComponent?.markForCheck();
};

function updateZoom(board: PlaitBoard, newZoom: number, isCenter = true) {
    newZoom = clampZoomLevel(newZoom);

    const mousePoint = PlaitBoard.getMovingPoint(board);
    const nativeElement = PlaitBoard.getBoardNativeElement(board);
    const nativeElementRect = nativeElement.getBoundingClientRect();
    const boardContainerRect = PlaitBoard.getBoardNativeElement(board).getBoundingClientRect();
    let focusPoint = [boardContainerRect.width / 2, boardContainerRect.height / 2];

    if (!isCenter && mousePoint && distanceBetweenPointAndRectangle(mousePoint[0], mousePoint[1], nativeElementRect) === 0) {
        focusPoint = toPoint(mousePoint[0], mousePoint[1], (nativeElement as unknown) as SVGElement);
    }

    const zoom = board.viewport.zoom;
    const origination = getViewportOrigination(board);
    const centerX = origination![0] + focusPoint[0] / zoom;
    const centerY = origination![1] + focusPoint[1] / zoom;
    const newOrigination = [centerX - focusPoint[0] / newZoom, centerY - focusPoint[1] / newZoom] as Point;
    updateViewport(board, newOrigination, newZoom);
}

function fitViewport(board: PlaitBoard) {
    const { hideScrollbar } = board.options;
    let scrollBarWidth = 0;
    if (!hideScrollbar) {
        const viewportContainer = PlaitBoard.getViewportContainer(board);
        scrollBarWidth = viewportContainer.offsetWidth - viewportContainer.clientWidth;
    }

    const boardContainerRect = PlaitBoard.getBoardNativeElement(board).getBoundingClientRect();
    const elementHostBox = getRectangleByElements(board, board.children, true);
    const zoom = board.viewport.zoom;
    const autoFitPadding = 16;
    const viewportWidth = boardContainerRect.width - 2 * autoFitPadding;
    const viewportHeight = boardContainerRect.height - 2 * autoFitPadding;

    let newZoom = zoom;
    if (viewportWidth < elementHostBox.width || viewportHeight < elementHostBox.height) {
        newZoom = Math.min(viewportWidth / elementHostBox.width, viewportHeight / elementHostBox.height);
    } else {
        newZoom = 1;
    }

    const viewBox = getViewBox(board, newZoom);
    const centerX = viewBox[0] + viewBox[2] / 2;
    const centerY = viewBox[1] + viewBox[3] / 2;
    const newOrigination = [
        centerX - boardContainerRect.width / 2 / newZoom + scrollBarWidth / 2 / zoom,
        centerY - boardContainerRect.height / 2 / newZoom + scrollBarWidth / 2 / zoom
    ] as Point;
    updateViewport(board, newOrigination, newZoom);
}

/**
 * apply theme to every element (remove element custom properties)
 * invoke applyThemeColor
 */
function updateThemeColor(board: PlaitBoard, mode: ThemeColorMode) {
    mode = mode ?? board.theme.themeColorMode;
    setTheme(board, { themeColorMode: mode });

    depthFirstRecursion((board as unknown) as PlaitElement, element => {
        board.applyTheme(element);
    });
}

export const BoardTransforms = {
    updatePointerType,
    updateViewport,
    fitViewport,
    updateZoom,
    updateThemeColor
};
