import { SCROLL_BAR_WIDTH } from '../constants';
import { PlaitBoard, Point, RectangleClient } from '../interfaces';
import { Transforms } from '../transforms';
import { toPoint } from './dom';
import { getRectangleByElements } from './element';
import { distanceBetweenPointAndRectangle } from './math';
import { BOARD_TO_MOVING_POINT, BOARD_TO_VIEWPORT_ORIGINATION } from './weak-maps';

const IS_FROM_SCROLLING = new WeakMap<PlaitBoard, boolean>();

const IS_FROM_VIEWPORT_CHANGE = new WeakMap<PlaitBoard, boolean>();

export function getViewportContainerRect(board: PlaitBoard) {
    const { hideScrollbar } = board.options;
    const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
    const viewportRect = PlaitBoard.getBoardNativeElement(board).getBoundingClientRect();

    return {
        width: viewportRect.width + scrollBarWidth,
        height: viewportRect.height + scrollBarWidth
    };
}

export function getElementHostBBox(board: PlaitBoard, zoom: number) {
    const childrenRect = getRectangleByElements(board, board.children, true);
    const viewportContainerRect = PlaitBoard.getBoardNativeElement(board).getBoundingClientRect();
    const containerWidth = viewportContainerRect.width / zoom;
    const containerHeight = viewportContainerRect.height / zoom;
    let left: number;
    let right: number;
    let top: number;
    let bottom: number;

    if (childrenRect.width < containerWidth) {
        const centerX = childrenRect.x + childrenRect.width / 2;
        const halfContainerWidth = containerWidth / 2;
        left = centerX - halfContainerWidth;
        right = centerX + halfContainerWidth;
    } else {
        left = childrenRect.x;
        right = childrenRect.x + childrenRect.width;
    }
    if (childrenRect.height < containerHeight) {
        const centerY = childrenRect.y + childrenRect.height / 2;
        const halfContainerHeight = containerHeight / 2;
        top = centerY - halfContainerHeight;
        bottom = centerY + halfContainerHeight;
    } else {
        top = childrenRect.y;
        bottom = childrenRect.y + childrenRect.height;
    }
    return {
        left,
        right,
        top,
        bottom
    };
}

/**
 * 验证缩放比是否符合限制，如果超出限制，则返回合适的缩放比
 * @param zoom 缩放比
 * @param minZoom 最小缩放比
 * @param maxZoom 最大缩放比
 * @returns 正确的缩放比
 */
export function clampZoomLevel(zoom: number, minZoom = 0.2, maxZoom = 4) {
    return zoom < minZoom ? minZoom : zoom > maxZoom ? maxZoom : zoom;
}

export function getViewBox(board: PlaitBoard, zoom: number) {
    const { hideScrollbar } = board.options;
    const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
    const viewportContainerRect = PlaitBoard.getBoardNativeElement(board).getBoundingClientRect();
    const elementHostBBox = getElementHostBBox(board, zoom);
    const horizontalPadding = viewportContainerRect.width / 2;
    const verticalPadding = viewportContainerRect.height / 2;
    const viewportWidth = (elementHostBBox.right - elementHostBBox.left) * zoom + 2 * horizontalPadding + scrollBarWidth;
    const viewportHeight = (elementHostBBox.bottom - elementHostBBox.top) * zoom + 2 * verticalPadding + scrollBarWidth;
    const viewBox = [
        elementHostBBox.left - horizontalPadding / zoom,
        elementHostBBox.top - verticalPadding / zoom,
        viewportWidth / zoom,
        viewportHeight / zoom
    ];
    return viewBox;
}

export function setSVGViewBox(board: PlaitBoard, viewBox: number[]) {
    const zoom = board.viewport.zoom;
    const hostElement = PlaitBoard.getHost(board);
    hostElement.style.display = 'block';
    hostElement.style.width = `${viewBox[2] * zoom}px`;
    hostElement.style.height = `${viewBox[3] * zoom}px`;

    if (viewBox && viewBox[2] > 0 && viewBox[3] > 0) {
        hostElement.setAttribute('viewBox', viewBox.join(' '));
    }
}

export function updateViewportOffset(board: PlaitBoard) {
    const origination = getViewportOrigination(board);
    if (!origination) return;

    const { zoom } = board.viewport;
    const viewBox = getViewBox(board, zoom);
    const scrollLeft = (origination![0] - viewBox[0]) * zoom;
    const scrollTop = (origination![1] - viewBox[1]) * zoom;
    updateViewportContainerScroll(board, scrollLeft, scrollTop);
}

export function updateViewportContainerScroll(board: PlaitBoard, left: number, top: number, isFromViewportChange: boolean = true) {
    const viewportContainer = PlaitBoard.getViewportContainer(board);
    if (viewportContainer.scrollLeft !== left || viewportContainer.scrollTop !== top) {
        viewportContainer.scrollLeft = left;
        viewportContainer.scrollTop = top;
        isFromViewportChange && setIsFromViewportChange(board, true);
    }
}

export function initializeViewportContainer(board: PlaitBoard) {
    const { width, height } = getViewportContainerRect(board);
    const viewportContainer = PlaitBoard.getViewportContainer(board);
    viewportContainer.style.width = `${width}px`;
    viewportContainer.style.height = `${height}px`;
}

export function initializeViewBox(board: PlaitBoard) {
    const zoom = board.viewport.zoom;
    const viewBox = getViewBox(board, zoom);
    setSVGViewBox(board, viewBox);
}

export function initializeViewportOffset(board: PlaitBoard) {
    if (!board.viewport?.origination) {
        const zoom = board.viewport.zoom;
        const viewportContainerRect = PlaitBoard.getBoardNativeElement(board).getBoundingClientRect();
        const viewBox = getViewBox(board, zoom);
        const centerX = viewBox[0] + viewBox[2] / 2;
        const centerY = viewBox[1] + viewBox[3] / 2;
        const origination = [centerX - viewportContainerRect.width / 2 / zoom, centerY - viewportContainerRect.height / 2 / zoom] as Point;
        updateViewportOrigination(board, origination);
        updateViewportOffset(board);
        return;
    }
    updateViewportOffset(board);
}

export function setViewport(board: PlaitBoard, origination: Point, zoom?: number) {
    zoom = zoom ?? board.viewport.zoom;
    Transforms.setViewport(board, {
        ...board.viewport,
        zoom,
        origination
    });
    clearViewportOrigination(board);
}

export function changeZoom(board: PlaitBoard, newZoom: number, isCenter = true) {
    newZoom = clampZoomLevel(newZoom);

    const mousePoint = BOARD_TO_MOVING_POINT.get(board);
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
    setViewport(board, newOrigination, newZoom);
}

export function fitViewport(board: PlaitBoard) {
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
    setViewport(board, newOrigination, newZoom);
}

export const updateViewportOrigination = (board: PlaitBoard, origination: Point) => {
    BOARD_TO_VIEWPORT_ORIGINATION.set(board, origination);
};

export const clearViewportOrigination = (board: PlaitBoard) => {
    BOARD_TO_VIEWPORT_ORIGINATION.delete(board);
};

export const getViewportOrigination = (board: PlaitBoard) => {
    const origination = BOARD_TO_VIEWPORT_ORIGINATION.get(board);
    if (origination) {
        return origination;
    } else {
        return board.viewport.origination;
    }
};

export const isFromScrolling = (board: PlaitBoard) => {
    return !!IS_FROM_SCROLLING.get(board);
};

export const setIsFromScrolling = (board: PlaitBoard, state: boolean) => {
    IS_FROM_SCROLLING.set(board, state);
};

export const isFromViewportChange = (board: PlaitBoard) => {
    return !!IS_FROM_VIEWPORT_CHANGE.get(board);
};

export const setIsFromViewportChange = (board: PlaitBoard, state: boolean) => {
    IS_FROM_VIEWPORT_CHANGE.set(board, state);
};

export function scrollToRectangle(board: PlaitBoard, client: RectangleClient) {}
