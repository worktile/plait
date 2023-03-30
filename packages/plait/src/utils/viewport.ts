import { SCROLL_BAR_WIDTH } from '../constants';
import { PlaitBoard, RectangleClient } from '../interfaces';
import { Transforms } from '../transforms';
import { getRectangleByElements } from './element';
import {
    clampZoomLevel,
    convertToViewportCoordinates,
    getRootGroupBBox,
    getViewportContainerBox,
    invertViewportCoordinates,
    transformMat3,
    ViewportBox
} from './matrix';

export function getMatrix(board: PlaitBoard, zoom?: number): number[] {
    zoom = zoom ?? board.viewport.zoom;
    const boardComponent = PlaitBoard.getComponent(board);
    // 当前的
    const { scrollLeft, scrollTop } = boardComponent.viewportState;
    const viewBoxStr = PlaitBoard.getHost(board).getAttribute('viewBox');
    const viewBox = viewBoxStr ? viewBoxStr.split(' ').map(item => Number(item)) : [];

    if (scrollLeft! >= 0 && scrollTop! >= 0) {
        console.log(`matrix: ${[zoom, 0, 0, 0, zoom, 0, -scrollLeft! - zoom * viewBox![0], -scrollTop! - zoom * viewBox![1], 1]}`);
        return [zoom, 0, 0, 0, zoom, 0, -scrollLeft! - zoom * viewBox![0], -scrollTop! - zoom * viewBox![1], 1];
    }
    return [];
}

export function setScroll(board: PlaitBoard, left: number, top: number) {
    const boardComponent = PlaitBoard.getComponent(board);
    const { viewportWidth, viewportHeight } = boardComponent.viewportState;
    const { hideScrollbar } = board.options;
    const viewportContainerBox = getViewportContainerBox(board);
    const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
    const width = viewportWidth! - viewportContainerBox.width + scrollBarWidth;
    const height = viewportHeight! - viewportContainerBox.height + scrollBarWidth;

    boardComponent.viewportState.scrollLeft = left < 0 ? 0 : left > width ? width : left;
    boardComponent.viewportState.scrollTop = top < 0 ? 0 : top > height ? height : top;
}

function calculateScroll(matrix: number[], zoom: number, viewBox: number[], viewportContainerBox: ViewportBox) {
    const viewportCenter = [viewportContainerBox.width / 2, viewportContainerBox.height / 2];
    if (matrix.length === 0) {
        return { scrollLeft: viewportCenter[0], scrollTop: viewportCenter[1] };
    }

    const point = invertViewportCoordinates(viewportCenter, matrix);
    const newMatrix = [zoom, 0, 0, 0, zoom, 0, -zoom * viewBox[0], -zoom * viewBox[1], 1];
    const newPoint = transformMat3([], point, newMatrix);

    return {
        scrollLeft: newPoint[0] - viewportCenter[0],
        scrollTop: newPoint[1] - viewportCenter[1]
    };
}

export function getViewBox(board: PlaitBoard, zoom: number) {
    const { hideScrollbar } = board.options;
    const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
    const viewportContainerBox = getViewportContainerBox(board);
    // 确认获取的是什么? 是实际内容占的宽高？
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

export function calcViewBox(board: PlaitBoard, zoom: number) {
    clampZoomLevel(zoom);
    const { hideScrollbar } = board.options;
    const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
    // 确认计算时为啥要减去 scrollBarWidth
    const viewportContainerBox = getViewportContainerBox(board);
    // 确认获取的是什么? 是实际内容占的宽高？
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

    // 当前渲染的矩阵数据
    const matrix = getMatrix(board);
    const { scrollLeft, scrollTop } = calculateScroll(matrix, zoom, viewBox, viewportContainerBox);

    const matrix2 = [zoom, 0, 0, 0, zoom, 0, -scrollLeft! - zoom * viewBox![0], -scrollTop! - zoom * viewBox![1], 1];
    console.log(`matrix2: ${matrix2}`);
    const originationCoord = invertViewportCoordinates([0, 0], matrix2);
    console.log(`originationCoord: ${originationCoord}`);
    return {
        viewportWidth,
        viewportHeight,
        scrollLeft,
        scrollTop,
        viewBox,
        originationCoord
    };
}

export function fitViewport(board: PlaitBoard) {
    const boardComponent = PlaitBoard.getComponent(board);
    const containerBox = getViewportContainerBox(board);
    const rootGroupBox = getRectangleByElements(board, board.children, true);
    const matrix = getMatrix(board);

    const rootGroupCenter = [rootGroupBox.x + rootGroupBox.width / 2, rootGroupBox.y + rootGroupBox.height / 2];
    const transformedRootGroupCenter = transformMat3([], [...rootGroupCenter, 1], matrix);

    const containerCenter = [containerBox.width / 2, containerBox.height / 2];
    const offsetLeft = containerCenter[0] - transformedRootGroupCenter[0];
    const offsetTop = containerCenter[1] - transformedRootGroupCenter[1];

    const autoFitPadding = 8;
    const viewportWidth = containerBox.width - 2 * autoFitPadding;
    const viewportHeight = containerBox.height - 2 * autoFitPadding;
    const { scrollLeft, scrollTop } = boardComponent.viewportState;

    let newZoom = board.viewport.zoom;
    if (viewportWidth < rootGroupBox.width || viewportHeight < rootGroupBox.height) {
        newZoom = Math.min(viewportWidth / rootGroupBox.width, viewportHeight / rootGroupBox.height);
    } else {
        newZoom = 1;
    }

    setScroll(board, scrollLeft! - offsetLeft, scrollTop! - offsetTop);
    setViewport(board, newZoom);
}

export function setViewport(board: PlaitBoard, zoom?: number) {
    zoom = zoom ?? board.viewport.zoom;
    const viewport = board?.viewport;
    const { originationCoord } = calcViewBox(board, zoom);

    Transforms.setViewport(board, {
        ...viewport,
        zoom,
        originationCoord
    });
    console.log(`set originationCoord: ${originationCoord}`);
}

export function scrollToRectangle(board: PlaitBoard, client: RectangleClient) {
    const host = PlaitBoard.getHost(board);
    const svgRect = host.getBoundingClientRect();
    const viewportContainerBox = getViewportContainerBox(board);

    if (svgRect.width > viewportContainerBox.width || svgRect.height > viewportContainerBox.height) {
        const boardComponent = PlaitBoard.getComponent(board);
        const { viewportState } = boardComponent;
        const { hideScrollbar } = board.options;
        const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
        const matrix = getMatrix(board);
        const [nodePointX, nodePointY] = convertToViewportCoordinates([client.x, client.y], matrix);
        const [fullNodePointX, fullNodePointY] = convertToViewportCoordinates([client.x + client.width, client.y + client.height], matrix);

        let newLeft = viewportState.scrollLeft!;
        let newTop = viewportState.scrollTop!;

        if (nodePointX < 0) {
            newLeft -= Math.abs(nodePointX);
        }
        if (nodePointX > 0 && fullNodePointX > viewportContainerBox.width) {
            newLeft += fullNodePointX - viewportContainerBox.width + scrollBarWidth;
        }

        if (nodePointY < 0) {
            newTop -= Math.abs(nodePointY);
        }
        if (nodePointY > 0 && fullNodePointY > viewportContainerBox.height) {
            newTop += fullNodePointY - viewportContainerBox.height + scrollBarWidth;
        }

        if (newLeft !== viewportState.scrollLeft! || newTop !== viewportState.scrollTop!) {
            setScroll(board, newLeft, newTop);
            setViewport(board);
        }
    }
}
