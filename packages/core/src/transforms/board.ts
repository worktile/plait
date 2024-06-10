import { ThemeColorMode } from '../interfaces/theme';
import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { getRectangleByElements } from '../utils/element';
import { distanceBetweenPointAndRectangle } from '../utils/math';
import {
    clampZoomLevel,
    clearViewportOrigination,
    getViewBoxCenterPoint,
    getViewportOrigination,
    initializeViewportContainer
} from '../utils/viewport';
import { setViewport } from './viewport';
import { depthFirstRecursion, getRealScrollBarWidth } from '../utils';
import { PlaitElement } from '../interfaces/element';
import { setTheme } from './theme';
import { FitViewportOptions } from '../interfaces/viewport';
import { PlaitPointerType } from '../interfaces/pointer';

function updateViewport(board: PlaitBoard, origination: Point, zoom?: number) {
    zoom = zoom ?? board.viewport.zoom;
    setViewport(board, {
        ...board.viewport,
        zoom,
        origination
    });
    clearViewportOrigination(board);
}

function updateZoom(board: PlaitBoard, newZoom: number, isCenter = true) {
    newZoom = clampZoomLevel(newZoom);

    const movingPoint = PlaitBoard.getMovingPointInBoard(board);
    const nativeElement = PlaitBoard.getBoardContainer(board);
    const nativeElementRect = nativeElement.getBoundingClientRect();
    const boardContainerRect = PlaitBoard.getBoardContainer(board).getBoundingClientRect();
    let focusPoint = [boardContainerRect.width / 2, boardContainerRect.height / 2];

    if (!isCenter && movingPoint && distanceBetweenPointAndRectangle(movingPoint[0], movingPoint[1], nativeElementRect) === 0) {
        focusPoint = [movingPoint[0] - nativeElementRect.x, movingPoint[1] - nativeElementRect.y];
    }

    const zoom = board.viewport.zoom;
    const origination = getViewportOrigination(board);
    const centerX = origination![0] + focusPoint[0] / zoom;
    const centerY = origination![1] + focusPoint[1] / zoom;
    const newOrigination = [centerX - focusPoint[0] / newZoom, centerY - focusPoint[1] / newZoom] as Point;
    updateViewport(board, newOrigination, newZoom);
}

function fitViewport(board: PlaitBoard) {
    let scrollBarWidth = getRealScrollBarWidth(board);

    const boardContainerRect = PlaitBoard.getBoardContainer(board).getBoundingClientRect();
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

    const centerPoint = getViewBoxCenterPoint(board);
    const newOrigination = [
        centerPoint[0] - boardContainerRect.width / 2 / newZoom + scrollBarWidth / 2 / zoom,
        centerPoint[1] - boardContainerRect.height / 2 / newZoom + scrollBarWidth / 2 / zoom
    ] as Point;
    updateViewport(board, newOrigination, newZoom);
}

function fitViewportWidth(board: PlaitBoard, options: FitViewportOptions) {
    let scrollBarWidth = getRealScrollBarWidth(board);

    const boardContainer = PlaitBoard.getBoardContainer(board);
    const boardContainerRectangle = boardContainer.getBoundingClientRect();

    let finalWidth = 0;
    if (options.maxWidth) {
        finalWidth = options.maxWidth;
    } else {
        finalWidth = boardContainerRectangle.width;
    }

    const elementHostBox = getRectangleByElements(board, board.children, true);
    const contentWidth = finalWidth - 2 * options.autoFitPadding;
    let newZoom = 0;
    if (contentWidth < elementHostBox.width) {
        newZoom = Math.min(contentWidth / elementHostBox.width);
    } else {
        newZoom = 1;
    }

    let finalHeight = elementHostBox.height * newZoom + 2 * options.autoFitPadding;
    if (finalHeight > options.limitHeight) {
        const containerEl = boardContainer.closest(`.${options.containerClass}`) as HTMLElement;
        containerEl.style.height = `${finalHeight}px`;
        initializeViewportContainer(board);
    } else {
        finalHeight = options.limitHeight;
    }

    const centerX = elementHostBox.x + elementHostBox.width / 2;
    const centerY = elementHostBox.y + elementHostBox.height / 2;
    const newOrigination = [
        centerX - finalWidth / 2 / newZoom + scrollBarWidth / 2 / newZoom,
        centerY - finalHeight / 2 / newZoom + scrollBarWidth / 2 / newZoom
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

const updatePointerType = <T extends string = PlaitPointerType>(board: PlaitBoard, pointer: T) => {
    if (board.pointer === pointer) return;
    const previousPointer = board.pointer;
    board.pointer = pointer;
    const boardContainer = PlaitBoard.getBoardContainer(board);
    boardContainer.classList.remove(`pointer-${previousPointer}`);
    boardContainer.classList.add(`pointer-${pointer}`);
};

export const BoardTransforms = {
    updatePointerType,
    updateViewport,
    fitViewport,
    updateZoom,
    updateThemeColor,
    fitViewportWidth
};
