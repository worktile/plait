import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { PlaitPointerType } from '../interfaces/pointer';
import { toPoint } from '../utils/dom/common';
import { getRectangleByElements } from '../utils/element';
import { distanceBetweenPointAndRectangle } from '../utils/math';
import { clampZoomLevel, clearViewportOrigination, getViewBox, getViewportContainerRect, getViewportOrigination } from '../utils/viewport';
import { BOARD_TO_COMPONENT } from '../utils/weak-maps';
import { setViewport } from './viewport';

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
    const viewportContainerRect = getViewportContainerRect(board);
    let focusPoint = [viewportContainerRect.width / 2, viewportContainerRect.height / 2];

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
    const nativeElementRect = PlaitBoard.getBoardNativeElement(board).getBoundingClientRect();
    const viewportContainerRect = getViewportContainerRect(board);
    const elementHostBox = getRectangleByElements(board, board.children, true);
    const zoom = board.viewport.zoom;
    const autoFitPadding = 16;
    const viewportWidth = nativeElementRect.width - 2 * autoFitPadding;
    const viewportHeight = nativeElementRect.height - 2 * autoFitPadding;

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
        centerX - viewportContainerRect.width / 2 / newZoom,
        centerY - viewportContainerRect.height / 2 / newZoom
    ] as Point;
    updateViewport(board, newOrigination, newZoom);
}

export const BoardTransforms = {
    updatePointerType,
    updateViewport,
    fitViewport,
    updateZoom
};
