import { SCROLL_BAR_WIDTH } from '../constants';
import { PlaitBoard, RectangleClient } from '../interfaces';
import { Transforms } from '../transforms';
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
    const { scrollLeft, scrollTop } = boardComponent.viewportState;
    const viewBoxStr = PlaitBoard.getHost(board).getAttribute('viewBox');
    const viewBox = viewBoxStr ? viewBoxStr.split(' ').map(item => Number(item)) : [];

    if (scrollLeft! >= 0 && scrollTop! >= 0) {
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

    // 视口坐标系转换到世界坐标系, 计算视口中心在世界坐标系下的位置
    const point = invertViewportCoordinates(viewportCenter, matrix);
    // 使用新的缩放比例和 viewBox 创建一个新的矩阵
    // 这个新矩阵将用于将世界坐标系下的点转换到视口坐标系
    const newMatrix = [zoom, 0, 0, 0, zoom, 0, -zoom * viewBox[0], -zoom * viewBox[1], 1];
    // 将世界坐标系下的点（point）转换到视口坐标系下（transformMat3），得到一个新的点（newPoint）。
    // 这是为了计算视口中心在新矩阵变换下的位置
    const newPoint = transformMat3([], point, newMatrix);

    return {
        scrollLeft: newPoint[0] - viewportCenter[0],
        scrollTop: newPoint[1] - viewportCenter[1]
    };
}

export function calcViewBox(board: PlaitBoard, zoom: number) {
    clampZoomLevel(zoom);
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
    const matrix = getMatrix(board);
    const { scrollLeft, scrollTop } = calculateScroll(matrix, zoom, viewBox, viewportContainerBox);

    const matrix2 = [zoom, 0, 0, 0, zoom, 0, -scrollLeft! - zoom * viewBox![0], -scrollTop! - zoom * viewBox![1], 1];
    const originationCoord = invertViewportCoordinates([0, 0], matrix2);

    return {
        viewportWidth,
        viewportHeight,
        scrollLeft,
        scrollTop,
        viewBox,
        originationCoord
    };
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
