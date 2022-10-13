import { SCROLL_BAR_WIDTH } from '../constants';
import { PlaitBoard } from '../interfaces';
import { ViewBox } from './board';

export function invert(oldMatrix: number[], newMatrix: number[]) {
    let n = newMatrix[0],
        r = newMatrix[1],
        a = newMatrix[2],
        i = newMatrix[3],
        o = newMatrix[4],
        c = newMatrix[5],
        l = newMatrix[6],
        s = newMatrix[7],
        u = newMatrix[8],
        d = u * o - c * s,
        h = -u * i + c * l,
        f = s * i - o * l,
        p = n * d + r * h + a * f;

    return p
        ? ((p = 1 / p),
          (oldMatrix[0] = d * p),
          (oldMatrix[1] = (-u * r + a * s) * p),
          (oldMatrix[2] = (c * r - a * o) * p),
          (oldMatrix[3] = h * p),
          (oldMatrix[4] = (u * n - a * l) * p),
          (oldMatrix[5] = (-c * n + a * i) * p),
          (oldMatrix[6] = f * p),
          (oldMatrix[7] = (-s * n + r * l) * p),
          (oldMatrix[8] = (o * n - r * i) * p),
          oldMatrix)
        : null;
}

export function transformMat3(e: number[], t: number[], n: number[]) {
    const r = t[0];
    const a = t[1];
    const i = t[2];

    return (e[0] = r * n[0] + a * n[3] + i * n[6]), (e[1] = r * n[1] + a * n[4] + i * n[7]), (e[2] = r * n[2] + a * n[5] + i * n[8]), e;
}

export function getViewportClientBox(board: PlaitBoard) {
    const hideScrollbar = board.options.hideScrollbar;
    const scrollBarWidth = hideScrollbar ? SCROLL_BAR_WIDTH : 0;
    const container = board.host?.parentElement as HTMLElement;
    const containerRect = container?.getBoundingClientRect();
    const width = containerRect.width - scrollBarWidth;
    const height = containerRect.height - scrollBarWidth;
    const x = containerRect.x || containerRect.left;
    const y = containerRect.y || containerRect.top;

    return {
        width,
        height,
        x,
        y
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
