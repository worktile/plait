import { SCROLL_BAR_WIDTH } from '../constants';
import { PlaitBoard, RectangleClient } from '../interfaces';
import { Transforms } from '../transforms';
import { toPoint } from './dom';
import { getRectangleByElements } from './element';
import { distanceBetweenPointAndRectangle } from './math';
import { BOARD_TO_MOVING_POINT } from './weak-maps';

/**
 * 规范 point
 * @param point
 * @returns point
 */
export function normalizePoint(point: number[]) {
    return Array.isArray(point)
        ? {
              x: point[0],
              y: point[1]
          }
        : point;
}

/**
 * 获取 contentContainer 的 clientBox
 * @param board
 * @returns
 */
export function getViewportContainerBox(board: PlaitBoard) {
    const { hideScrollbar } = board.options;
    const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
    const container = PlaitBoard.getViewportContainer(board);
    const containerRect = container.getBoundingClientRect();
    const x = containerRect.x || containerRect.left;
    const y = containerRect.y || containerRect.top;
    const width = containerRect.width - scrollBarWidth;
    const height = containerRect.height - scrollBarWidth;

    return {
        minX: x,
        minY: y,
        maxX: x + width,
        maxY: y + height,
        x,
        y,
        width,
        height
    };
}

/**
 * 获取 board.plait-board 的 clientBox
 * @param board
 * @returns
 */
export function getBoardClientBox(board: PlaitBoard) {
    const { hideScrollbar } = board.options;
    const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
    const viewportRect = PlaitBoard.getBoardNativeElement(board).getBoundingClientRect();

    return {
        width: viewportRect.width + scrollBarWidth,
        height: viewportRect.height + scrollBarWidth
    };
}

/**
 * 获取 rootGroup 相对于当前 svg 空间的最小矩阵坐标
 */
export function getRootGroupBBox(board: PlaitBoard, zoom: number) {
    const rootGroupBox = getRectangleByElements(board, board.children, true);
    const viewportContainerBox = getViewportContainerBox(board);
    const containerWidth = viewportContainerBox.width / zoom;
    const containerHeight = viewportContainerBox.height / zoom;
    let left: number;
    let right: number;
    let top: number;
    let bottom: number;

    if (rootGroupBox.width < containerWidth) {
        const offsetX = Math.ceil(rootGroupBox.x + rootGroupBox.width / 2);
        const containerX = Math.ceil(containerWidth / 2);
        left = offsetX - containerX;
        right = offsetX + containerX;
    } else {
        left = rootGroupBox.x;
        right = rootGroupBox.x + rootGroupBox.width;
    }
    if (rootGroupBox.height < containerHeight) {
        const offsetY = Math.ceil(rootGroupBox.y + rootGroupBox.height / 2);
        const containerY = Math.ceil(containerHeight / 2);
        top = offsetY - containerY;
        bottom = offsetY + containerY;
    } else {
        top = rootGroupBox.y;
        bottom = rootGroupBox.y + rootGroupBox.height;
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
    const viewportContainerBox = getViewportContainerBox(board);
    const groupBBox = getRootGroupBBox(board, zoom);
    const horizontalPadding = viewportContainerBox.width / 2;
    const verticalPadding = viewportContainerBox.height / 2;
    const viewportWidth = (groupBBox.right - groupBBox.left) * zoom + 2 * horizontalPadding + scrollBarWidth;
    const viewportHeight = (groupBBox.bottom - groupBBox.top) * zoom + 2 * verticalPadding + scrollBarWidth;
    const viewBox = [
        groupBBox.left - horizontalPadding / zoom,
        groupBBox.top - verticalPadding / zoom,
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

export function updateScrollOffset(board: PlaitBoard, origination?: number[]) {
    origination = origination ?? board.viewport.origination;
    if (!origination) return;

    const { zoom } = board.viewport;
    const viewBox = getViewBox(board, zoom);
    const scrollLeft = (origination![0] - viewBox[0]) * zoom;
    const scrollTop = (origination![1] - viewBox[1]) * zoom;

    const viewportContainer = PlaitBoard.getViewportContainer(board);
    viewportContainer.scrollLeft = Math.floor(scrollLeft);
    viewportContainer.scrollTop = Math.floor(scrollTop);
}

export function initializeViewport(board: PlaitBoard) {
    const zoom = board.viewport.zoom;
    const viewBox = getViewBox(board, zoom);
    setSVGViewBox(board, viewBox);
}

export function initializeScrollOffset(board: PlaitBoard) {
    if (!board.viewport?.origination) {
        const zoom = board.viewport.zoom;
        const viewportContainerBox = getViewportContainerBox(board);
        const viewBox = getViewBox(board, zoom);
        const centerX = viewBox[0] + viewBox[2] / 2;
        const centerY = viewBox[1] + viewBox[3] / 2;
        const origination = [centerX - viewportContainerBox.width / 2 / zoom, centerY - viewportContainerBox.height / 2 / zoom];
        updateScrollOffset(board, origination);
        return;
    }
    updateScrollOffset(board);
}

export function setViewport(board: PlaitBoard, origination: number[], zoom?: number) {
    zoom = zoom ?? board.viewport.zoom;
    Transforms.setViewport(board, {
        ...board.viewport,
        zoom,
        origination
    });
}

export function changeZoom(board: PlaitBoard, newZoom: number, isCenter = true) {
    newZoom = clampZoomLevel(newZoom);

    const mousePoint = BOARD_TO_MOVING_POINT.get(board);
    const nativeElement = PlaitBoard.getBoardNativeElement(board);
    const rect = nativeElement.getBoundingClientRect();
    const viewportContainerBox = getViewportContainerBox(board);
    let focusPoint = [viewportContainerBox.width / 2, viewportContainerBox.height / 2];

    if (!isCenter && mousePoint && distanceBetweenPointAndRectangle(mousePoint[0], mousePoint[1], rect) === 0) {
        focusPoint = toPoint(mousePoint[0], mousePoint[1], (nativeElement as unknown) as SVGElement);
    }

    const { origination, zoom } = board.viewport;
    const centerX = origination![0] + focusPoint[0] / zoom;
    const centerY = origination![1] + focusPoint[1] / zoom;
    const viewBox = getViewBox(board, newZoom);
    const newOrigination = [centerX - focusPoint[0] / newZoom, centerY - focusPoint[1] / newZoom];

    setSVGViewBox(board, viewBox);
    setViewport(board, newOrigination, newZoom);
}

export function fitViewport(board: PlaitBoard) {
    const viewportContainerBox = getViewportContainerBox(board);
    const containerBox = getViewportContainerBox(board);
    const rootGroupBox = getRectangleByElements(board, board.children, true);
    const zoom = board.viewport.zoom;
    const autoFitPadding = 8;
    const viewportWidth = containerBox.width - 2 * autoFitPadding;
    const viewportHeight = containerBox.height - 2 * autoFitPadding;

    let newZoom = zoom;
    if (viewportWidth < rootGroupBox.width || viewportHeight < rootGroupBox.height) {
        newZoom = Math.min(viewportWidth / rootGroupBox.width, viewportHeight / rootGroupBox.height);
    } else {
        newZoom = 1;
    }

    const viewBox = getViewBox(board, newZoom);
    const centerX = viewBox[0] + viewBox[2] / 2;
    const centerY = viewBox[1] + viewBox[3] / 2;
    const newOrigination = [centerX - viewportContainerBox.width / 2 / newZoom, centerY - viewportContainerBox.height / 2 / newZoom];

    setSVGViewBox(board, viewBox);
    setViewport(board, newOrigination, newZoom);
}

export function scrollToRectangle(board: PlaitBoard, client: RectangleClient) {
    // const host = PlaitBoard.getHost(board);
    // const svgRect = host.getBoundingClientRect();
    // const viewportContainerBox = getViewportContainerBox(board);
    // if (svgRect.width > viewportContainerBox.width || svgRect.height > viewportContainerBox.height) {
    //     const boardComponent = PlaitBoard.getComponent(board);
    //     const { viewportState } = boardComponent;
    //     const { hideScrollbar } = board.options;
    //     const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
    //     // const matrix = getMatrix(board);
    //     const [nodePointX, nodePointY] = convertToViewportCoordinates([client.x, client.y], matrix);
    //     const [fullNodePointX, fullNodePointY] = convertToViewportCoordinates([client.x + client.width, client.y + client.height], matrix);
    //     let newLeft = viewportState.scrollLeft!;
    //     let newTop = viewportState.scrollTop!;
    //     if (nodePointX < 0) {
    //         newLeft -= Math.abs(nodePointX);
    //     }
    //     if (nodePointX > 0 && fullNodePointX > viewportContainerBox.width) {
    //         newLeft += fullNodePointX - viewportContainerBox.width + scrollBarWidth;
    //     }
    //     if (nodePointY < 0) {
    //         newTop -= Math.abs(nodePointY);
    //     }
    //     if (nodePointY > 0 && fullNodePointY > viewportContainerBox.height) {
    //         newTop += fullNodePointY - viewportContainerBox.height + scrollBarWidth;
    //     }
    //     if (newLeft !== viewportState.scrollLeft! || newTop !== viewportState.scrollTop!) {
    //         setScroll(board, newLeft, newTop);
    //         setViewport(board);
    //     }
    // }
}
