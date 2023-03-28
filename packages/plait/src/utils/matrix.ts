import { SCROLL_BAR_WIDTH } from '../constants';
import { PlaitBoard } from '../interfaces';
import { getRectangleByElements } from './element';

export interface ViewportBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * 逆矩阵
 * [a c e]
 * [b d f]
 * [0 0 1]
 * @param newMatrix 输出返回矩阵
 * @param matrix 新矩阵
 * @returns 逆矩阵
 */
export function invertMatrix(newMatrix: number[], matrix: number[]) {
    const [n, r, a, i, o, c, l, s, u] = matrix;
    const determinant = u * o - c * s;
    const h = -u * i + c * l;
    const f = s * i - o * l;
    const product = n * determinant + r * h + a * f;

    if (!product) {
        return null;
    }

    const reciprocal = 1 / product;
    newMatrix[0] = determinant * reciprocal;
    newMatrix[1] = (-u * r + a * s) * reciprocal;
    newMatrix[2] = (c * r - a * o) * reciprocal;
    newMatrix[3] = h * reciprocal;
    newMatrix[4] = (u * n - a * l) * reciprocal;
    newMatrix[5] = (-c * n + a * i) * reciprocal;
    newMatrix[6] = f * reciprocal;
    newMatrix[7] = (-s * n + r * l) * reciprocal;
    newMatrix[8] = (o * n - r * i) * reciprocal;

    return newMatrix;
}

/**
 * 将视图坐标与反转矩阵相乘，以得到原始坐标
 * 使用给定的矩阵进行转换
 * 矩阵与向量乘法，3 维向量与3x3矩阵的乘积
 * [m11 m12 m13][v1]
 * [m21 m22 m23][v2]
 * [m31 m32 m33][v3]
 * @param out 输出结果向量
 * @param t 要转换的向量
 * @param n 矩阵转换
 * @returns [v1 * m11 + v2 * m12 + v3 * m13, v1 * m21 + v2 * m22 + v3 * m23, v1 * m31 + v2 * m32 + v3 * m33];
 */
export function transformMat3(out: number[], vector: number[], matrix: number[]) {
    out = [
        vector[0] * matrix[0] + vector[1] * matrix[3] + vector[2] * matrix[6],
        vector[0] * matrix[1] + vector[1] * matrix[4] + vector[2] * matrix[7],
        vector[0] * matrix[2] + vector[1] * matrix[5] + vector[2] * matrix[8]
    ];
    return out;
}

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
 * 将一个点坐标反转回它的原始坐标
 * @param point 表示要反转的点的视图坐标，它是一个长度为 2 的数组，存储点的 x 和 y 坐标
 * @param matrix 表示视图矩阵，是在视图中对图形进行缩放和平移时使用的矩阵
 * @returns 最终结果是一个长度为 3 的数组，存储点的 x，y 和 w 坐标（w 坐标是点的齐次坐标)
 */
export function invertViewportCoordinates(point: number[], matrix: number[]) {
    const { x, y } = normalizePoint(point);
    const invertedMatrix = invertMatrix([], matrix);
    return transformMat3([], [x, y, 1], invertedMatrix as []);
}

export function convertToViewportCoordinates(point: number[], matrix: number[]) {
    const { x, y } = normalizePoint(point);
    return transformMat3([], [x, y, 1], matrix);
}

/**
 * 获取 contentContainer 的 clientBox
 * @param board
 * @returns
 */
export function getViewportContainerBox(board: PlaitBoard): ViewportBox {
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
