import { SCROLL_BAR_WIDTH } from '../constants';
import { PlaitBoard } from '../interfaces';
import { PLAIT_BOARD_TO_COMPONENT } from './weak-maps';

/**
 * 反转矩阵
 * [a c e]
 * [b d f]
 * [0 0 1]
 * @param newMatrix 输出返回矩阵
 * @param matrix 新矩阵
 * @returns 逆矩阵
 */
export function invert(newMatrix: number[], matrix: number[]) {
    let n = matrix[0],
        r = matrix[1],
        a = matrix[2],
        i = matrix[3],
        o = matrix[4],
        c = matrix[5],
        l = matrix[6],
        s = matrix[7],
        u = matrix[8],
        d = u * o - c * s,
        h = -u * i + c * l,
        f = s * i - o * l,
        p = n * d + r * h + a * f;

    if (p) {
        p = 1 / p;
        newMatrix[0] = d * p;
        newMatrix[1] = (-u * r + a * s) * p;
        newMatrix[2] = (c * r - a * o) * p;
        newMatrix[3] = h * p;
        newMatrix[4] = (u * n - a * l) * p;
        newMatrix[5] = (-c * n + a * i) * p;
        newMatrix[6] = f * p;
        newMatrix[7] = (-s * n + r * l) * p;
        newMatrix[8] = (o * n - r * i) * p;
        return newMatrix;
    }
    return null;
}

/**
 * 使用给定的矩阵进行转换
 * @param out 输出介绍向量
 * @param t 要转换的向量
 * @param n 矩阵转换
 * @returns
 */
export function transformMat3(out: number[], t: number[], n: number[]) {
    out = [t[0] * n[0] + t[1] * n[3] + t[2] * n[6], t[0] * n[1] + t[1] * n[4] + t[2] * n[7], t[0] * n[2] + t[1] * n[5] + t[2] * n[8]];
    return out;
}

/**
 * 转换出正确的 point
 * @param point
 * @returns point
 */
export function convertPoint(point: number[]) {
    return Array.isArray(point)
        ? {
              x: point[0],
              y: point[1]
          }
        : point;
}

/**
 * 反转 viewport
 * @param point
 * @param matrix 矩阵
 * @returns
 */
export function invertViewport(point: number[], matrix: number[]) {
    const newPoint = convertPoint(point);
    const invertMatrix = invert([], matrix);
    return transformMat3([], [newPoint.x, newPoint.y, 1], invertMatrix as []);
}

/**
 * 转换 viewport
 * @param point
 * @param matrix
 * @returns
 */
export function convertViewport(point: number[], matrix: number[]) {
    const newPoint = convertPoint(point);
    return transformMat3([], [newPoint.x, newPoint.y, 1], matrix);
}

/**
 * 获取 contentContainer 的 clientBox
 * @param board
 * @returns
 */
export function getContentContainerClientBox(board: PlaitBoard) {
    const hideScrollbar = board.options.hideScrollbar;
    const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
    const container = board.host?.parentElement as HTMLElement;
    const containerRect = container?.getBoundingClientRect();
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
    const hideScrollbar = board.options.hideScrollbar;
    const boardEl = board.host?.parentElement?.parentElement as HTMLElement;
    const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
    const elRect = boardEl?.getBoundingClientRect();
    const width = elRect.width + scrollBarWidth;
    const height = elRect.height + scrollBarWidth;

    return { width, height };
}

/**
 * 获取 rootGroup 的最小矩阵坐标
 * @param board 当前 board 对象
 * @param zoom 缩放比
 * @returns 返回首个 rootGroup 相对于当前 svg 空间的最小矩阵的坐标
 */
export function getRootGroupBBox(board: PlaitBoard, zoom: number) {
    const boardComponent = PLAIT_BOARD_TO_COMPONENT.get(board);
    const rootGroup = board.host.firstChild;
    const rootGroupBox = (rootGroup as SVGGraphicsElement).getBBox();
    const containerWidth = boardComponent!.contentContainerWidth / zoom;
    const containerHeight = boardComponent!.contentContainerHeight / zoom;
    let left: number;
    let right: number;
    let top: number;
    let bottom: number;

    if (rootGroupBox.width < containerWidth) {
        const offsetX = rootGroupBox.x + rootGroupBox.width / 2;
        const containerX = containerWidth / 2;
        left = offsetX - containerX;
        right = offsetX + containerX;
    } else {
        left = rootGroupBox.x;
        right = rootGroupBox.x + rootGroupBox.width;
    }
    if (rootGroupBox.height < containerHeight) {
        const offsetY = rootGroupBox.y + rootGroupBox.height / 2;
        const containerY = containerHeight / 2;
        top = offsetY - containerY;
        bottom = offsetY + containerY;
    } else {
        top = rootGroupBox.y;
        bottom = rootGroupBox.y + rootGroupBox.height;
    }
    return {
        x: rootGroupBox.x,
        y: rootGroupBox.y,
        width: rootGroupBox.width,
        height: rootGroupBox.height,
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
export function calculateZoom(zoom: number, minZoom = 0.2, maxZoom = 4) {
    return zoom < minZoom ? minZoom : zoom > maxZoom ? maxZoom : zoom;
}
