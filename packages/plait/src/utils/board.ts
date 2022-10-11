import { SCROLL_BAR_WIDTH } from '../constants';
import { BaseCursorStatus, PlaitBoard, Point } from '../interfaces';

export function transformPoints(board: PlaitBoard, points: Point[]) {
    const newPoints = points.map(point => {
        return transformPoint(board, point);
    });
    return newPoints;
}

export function transformPoint(board: PlaitBoard, point: Point) {
    const { width, height } = board.host.getBoundingClientRect();
    const viewBox = (board.host as SVGSVGElement).viewBox.baseVal;
    const x = (point[0] / width) * viewBox.width + viewBox.x;
    const y = (point[1] / height) * viewBox.height + viewBox.y;
    const newPoint = [x, y] as Point;

    return newPoint;
}

export function getViewBox(board: PlaitBoard): ViewBox {
    const viewportBox = getViewportClientBox(board);
    const rootGroupBBox = calculateBBox(board);
    const padding = [viewportBox.height / 2, viewportBox.width / 2];
    const zoom = board.viewport.zoom;
    const minX = rootGroupBBox.left - padding[1] / zoom;
    const minY = rootGroupBBox.top - padding[0] / zoom;
    const viewportWidth = (rootGroupBBox.right - rootGroupBBox.left) * zoom + 2 * padding[1];
    const viewportHeight = (rootGroupBBox.bottom - rootGroupBBox.top) * zoom + 2 * padding[0];
    const width = viewportWidth / zoom;
    const height = viewportHeight / zoom;

    return { minX, minY, width, height, viewportWidth, viewportHeight };
}

export function getViewportClientBox(board: PlaitBoard) {
    const hideScrollbar = board.options.hideScrollbar;
    const scrollBarWidth = hideScrollbar ? 0 : SCROLL_BAR_WIDTH;
    const container = board.host?.parentElement as HTMLElement;
    const containerRect = container?.getBoundingClientRect();
    const width = containerRect.width - scrollBarWidth;
    const height = containerRect.height - scrollBarWidth;

    return {
        width,
        height
    };
}

export function calculateBBox(board: PlaitBoard) {
    const viewportBox = getViewportClientBox(board);
    const rootGroup = board.host.firstChild;
    const zoom = board.viewport.zoom;
    const rootGroupBox = (rootGroup as SVGGraphicsElement).getBBox();

    let box = {} as any;
    const containerWidth = viewportBox.width / zoom;
    const containerHeight = viewportBox.height / zoom;

    if (rootGroupBox.width < containerWidth) {
        const offsetX = rootGroupBox.x + rootGroupBox.width / 2;
        const containerX = containerWidth / 2;
        box.left = offsetX - containerX;
        box.right = offsetX + containerX;
    } else {
        box.left = rootGroupBox.x;
        box.right = rootGroupBox.x + rootGroupBox.width;
    }

    if (rootGroupBox.height < containerHeight) {
        const offsetY = rootGroupBox.y + rootGroupBox.height / 2;
        const containerY = containerHeight / 2;
        box.top = offsetY - containerY;
        box.bottom = offsetY + containerY;
    } else {
        box.top = rootGroupBox.y;
        box.bottom = rootGroupBox.y + rootGroupBox.height;
    }

    // 在新的缩放比容器宽高下的内容盒子位置
    return box;
}

export function calculateZoom(zoom: number, minZoom = 0.2, maxZoom = 4) {
    return zoom < minZoom ? minZoom : zoom > maxZoom ? maxZoom : zoom;
}

export function isNoSelectionElement(e: Event) {
    return (e.target as HTMLElement)?.closest('.plait-board-attached');
}

/**
 * viewZoom 转 zoom
 * @param viewZoom 视图上显示的 zoom 缩放级别 %
 * @returns zoom 真实的 zoom
 */
export const transformViewZoom = (viewZoom: number): number => 2 - 100 / viewZoom;

/**
 * zoom 转 viewZoom
 * @param zoom this.board.viewport.zoom
 * @returns 视图上显示的 zoom 缩放级别 %
 */
export const transformZoom = (zoom: number): number => Number((100 / (2 - zoom)).toFixed(0));

export const updateCursorStatus = (board: PlaitBoard, cursor: BaseCursorStatus) => {
    if (cursor) {
        board.cursor = cursor;
    }
};

export type ViewBox = {
    minX: number;
    minY: number;
    width: number;
    height: number;
    viewportWidth: number;
    viewportHeight: number;
};
