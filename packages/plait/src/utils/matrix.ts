import { SCROLL_BAR_WIDTH } from '../constants';
import { PlaitBoard } from '../interfaces';

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
    e = [t[0] * n[0] + t[1] * n[3] + t[2] * n[6], t[0] * n[1] + t[1] * n[4] + t[2] * n[7], t[0] * n[2] + t[1] * n[5] + t[2] * n[8]];
    return e;
}

export function convertPoint(arr: number[]) {
    return Array.isArray(arr)
        ? {
              x: arr[0],
              y: arr[1]
          }
        : arr;
}

export function invertClient(board: PlaitBoard, point: number[], matrix: number[]) {
    const convert = convertPoint(point);
    const clientBox = getViewportClientBox(board);
    const newPoint = [convert.x - clientBox.x, convert.y - clientBox.y, 1];
    const invertMatrix = invert([], matrix);
    const newMatrix = transformMat3([], [newPoint[0], newPoint[1], 1], invertMatrix as []);

    return [newMatrix[0], newMatrix[1]];
}

export function invertViewport(point: number[], matrix: number[]) {
    const newPoint = convertPoint(point);
    const invertMatrix = invert([], matrix);
    return transformMat3([], [newPoint.x, newPoint.y, 1], invertMatrix as []);
}

export function convertViewport(point: number[], matrix: number[]) {
    const newPoint = convertPoint(point);
    return transformMat3([], [newPoint.x, newPoint.y, 1], matrix);
}

export function getViewportCanvasBox(board: PlaitBoard, matrix: number[]) {
    const clientBox = getViewportClientBox(board);
    const client = invertClient(board, [clientBox.minX, clientBox.minY], matrix);
    const newClient = invertClient(board, [clientBox.maxX, clientBox.maxY], matrix);

    return {
        minX: client[0],
        minY: client[1],
        maxX: newClient[0],
        maxY: newClient[1],
        x: client[0],
        y: client[1],
        width: newClient[0] - client[0],
        height: newClient[1] - client[1]
    };
}

export function getViewportClientBox(board: PlaitBoard) {
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

export function getGraphicsBBox(board: PlaitBoard) {
    const rootGroup = board.host.firstChild;
    const rootGroupBox = (rootGroup as SVGGraphicsElement).getBBox();
    return rootGroupBox;
}

export function calculateBBox(board: PlaitBoard, zoom: number) {
    const clientBox = getViewportClientBox(board);
    const rootGroup = board.host.firstChild;
    const rootGroupBox = (rootGroup as SVGGraphicsElement).getBBox();

    let box = {} as any;
    const containerWidth = clientBox.width / zoom;
    const containerHeight = clientBox.height / zoom;

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
