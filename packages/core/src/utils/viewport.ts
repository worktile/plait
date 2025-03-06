import { SCROLL_BAR_WIDTH } from '../constants';
import { MAX_ZOOM, MIN_ZOOM } from '../constants/zoom';
import { PlaitBoard, Point, RectangleClient } from '../interfaces';
import { BoardTransforms } from '../transforms/board';
import { getRectangleByElements } from './element';
import { approximately } from './math';
import { toHostPointFromViewBoxPoint, toViewBoxPoint } from './to-point';
import { BOARD_TO_VIEWPORT_ORIGINATION } from './weak-maps';

export const VIEWPORT_PADDING_RATIO = 0.75;

export interface ElementHostBBox {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

const IS_FROM_SCROLLING = new WeakMap<PlaitBoard, boolean>();

const IS_FROM_VIEWPORT_CHANGE = new WeakMap<PlaitBoard, boolean>();

export function getViewportContainerRect(board: PlaitBoard) {
    const { hideScrollbar } = board.options;
    const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
    const viewportRect = PlaitBoard.getBoardContainer(board).getBoundingClientRect();

    return {
        width: viewportRect.width + scrollBarWidth,
        height: viewportRect.height + scrollBarWidth
    };
}

export function getElementHostBBox(board: PlaitBoard, zoom: number): ElementHostBBox {
    const childrenRect = getRectangleByElements(board, board.children, true);
    let left: number;
    let right: number;
    let top: number;
    let bottom: number;
    left = childrenRect.x;
    right = childrenRect.x + childrenRect.width;
    top = childrenRect.y;
    bottom = childrenRect.y + childrenRect.height;
    return {
        left,
        right,
        top,
        bottom
    };
}

/**
 * Normalize the scaling ratio, or return the corrected scaling ratio if the limit is exceeded
 */
export function clampZoomLevel(zoom: number, minZoom = MIN_ZOOM, maxZoom = MAX_ZOOM) {
    return zoom < minZoom ? minZoom : zoom > maxZoom ? maxZoom : zoom;
}

export function calcNewViewBox(board: PlaitBoard, zoom: number) {
    const boardContainerRectangle = PlaitBoard.getBoardContainer(board).getBoundingClientRect();
    const elementHostBBox: ElementHostBBox = getElementHostBBox(board, zoom);

    const containerWidth = boardContainerRectangle.width;
    const containerHeight = boardContainerRectangle.height;

    // Calculate bounding box dimensions
    let width = elementHostBBox.right - elementHostBBox.left;
    let height = elementHostBBox.bottom - elementHostBBox.top;

    // If elementHostBBox dimensions are smaller than container dimensions,
    // use half of container dimensions as minimum size
    const minWidth = containerWidth / 2;
    const minHeight = containerHeight / 2;

    if (width < minWidth) {
        // Center the content horizontally if applying minimum width
        const center = elementHostBBox.left + width / 2;
        elementHostBBox.left = center - minWidth / 2 / zoom;
        elementHostBBox.right = center + minWidth / 2 / zoom;
        width = minWidth / zoom;
    }

    if (height < minHeight) {
        // Center the content vertically if applying minimum height
        const center = elementHostBBox.top + height / 2;
        elementHostBBox.top = center - minHeight / 2 / zoom;
        elementHostBBox.bottom = center + minHeight / 2 / zoom;
        height = minHeight / zoom;
    }

    const horizontalPaddingInViewBox = (containerWidth * VIEWPORT_PADDING_RATIO) / zoom;
    const verticalPaddingInViewBox = (containerHeight * VIEWPORT_PADDING_RATIO) / zoom;

    const viewBox = [
        elementHostBBox.left - horizontalPaddingInViewBox,
        elementHostBBox.top - verticalPaddingInViewBox,
        width + horizontalPaddingInViewBox * 2,
        height + verticalPaddingInViewBox * 2
    ];

    return viewBox;
}

export function getViewBoxCenterPoint(board: PlaitBoard) {
    const childrenRectangle = getRectangleByElements(board, board.children, true);
    return [childrenRectangle.x + childrenRectangle.width / 2, childrenRectangle.y + childrenRectangle.height / 2] as Point;
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
    if (!origination) {
        return;
    }
    const [scrollLeft, scrollTop] = toHostPointFromViewBoxPoint(board, origination);
    updateViewportContainerScroll(board, scrollLeft, scrollTop);
}

export function updateViewportContainerScroll(board: PlaitBoard, left: number, top: number, isFromViewportChange: boolean = true) {
    const viewportContainer = PlaitBoard.getViewportContainer(board);
    const previousScrollLeft = viewportContainer.scrollLeft;
    const previousScrollTop = viewportContainer.scrollTop;
    // scrollTop assign 11.8 will get 11.5 in chrome
    // scrollTop assign 11.8 will get 11 in firefox, safari
    // scrollTop assign 11.4 will get 11 in chrome, firefox, safari
    // use approximately method to determine the new value is valid updating to avoid debouncing
    if (!approximately(viewportContainer.scrollLeft, left, 1) || !approximately(viewportContainer.scrollTop, top, 1)) {
        viewportContainer.scrollLeft = left;
        viewportContainer.scrollTop = top;
        const offsetWidth = viewportContainer.offsetWidth;
        const offsetHeight = viewportContainer.offsetHeight;
        if (previousScrollLeft === viewportContainer.scrollLeft && previousScrollTop === viewportContainer.scrollTop) {
            // The scroll event cannot be triggered, so the origination is modified directly based on the scroll distance.
            updateViewportByScrolling(board, previousScrollLeft, previousScrollTop);
        } else {
            const isValidLeftOrTop =
                left > 0 &&
                top > 0 &&
                left < viewportContainer.scrollWidth - offsetWidth &&
                top < viewportContainer.scrollHeight - offsetHeight;
            if (isFromViewportChange && isValidLeftOrTop) {
                setIsFromViewportChange(board, true);
            }
        }
    }
}

export function updateViewportByScrolling(board: PlaitBoard, scrollLeft: number, scrollTop: number) {
    const origination = toViewBoxPoint(board, [scrollLeft, scrollTop]);
    if (Point.isEquals(origination, getViewportOrigination(board))) {
        return;
    }
    BoardTransforms.updateViewport(board, origination);
    setIsFromScrolling(board, true);
}

export function initializeViewportContainer(board: PlaitBoard) {
    const { width, height } = getViewportContainerRect(board);
    const viewportContainer = PlaitBoard.getViewportContainer(board);
    viewportContainer.style.width = `${width}px`;
    viewportContainer.style.height = `${height}px`;
}

export function initializeViewBox(board: PlaitBoard) {
    const zoom = board.viewport.zoom;
    const viewBox = calcNewViewBox(board, zoom);
    setSVGViewBox(board, viewBox);
}

export function initializeViewportOffset(board: PlaitBoard) {
    if (!board.viewport?.origination) {
        const zoom = board.viewport.zoom;
        const viewportContainerRect = PlaitBoard.getBoardContainer(board).getBoundingClientRect();
        const viewBox = calcNewViewBox(board, zoom);
        const centerX = viewBox[0] + viewBox[2] / 2;
        const centerY = viewBox[1] + viewBox[3] / 2;
        const origination = [centerX - viewportContainerRect.width / 2 / zoom, centerY - viewportContainerRect.height / 2 / zoom] as Point;
        updateViewportOrigination(board, origination);
        updateViewportOffset(board);
        return;
    }
    updateViewportOffset(board);
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
