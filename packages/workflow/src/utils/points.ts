import { Point, RectangleClient } from '@plait/core';
import { WorkflowElement } from '../interfaces';
import { WorkflowNodeComponent } from '../node.component';
import { WorkflowBaseComponent } from '../workflow-base.component';
import { getRectangleByNode } from './graph';

let rect1: RectangleClient, rect2: RectangleClient;

const MIN_DISTANCE = 30;
let easyMode = false;

// 计算所有可能经过的点
export const computedProbablyPoints = (
    startPoint: Point,
    endPoint: Point,
    startNode: WorkflowElement,
    endNode: WorkflowElement,
    easy = false
) => {
    rect1 = getRectangleByNode(startNode);
    rect2 = getRectangleByNode(endNode);

    // 保存矩形的尺寸、位置信息
    const { x: startX, y: startY, width: startWidth, height: startHeight } = rect1;
    const { x: endX, y: endY, width: endWidth, height: endHeight } = rect2;

    // 是否是宽松模式
    easyMode = easy;

    // 保存所有可能经过的点
    let points: Point[] = [];

    // 宽松模式则把真正的起点和终点加入点列表中
    if (easy) {
        points.push(startPoint, endPoint);
    }

    // 伪起点：经过起点且垂直于起点所在边的线与包围框线的交点
    let fakeStartPoint: Point | null = findStartNextOrEndPrePoint(rect1, startPoint);
    fakeStartPoint && points.push(fakeStartPoint);

    // 伪终点：经过终点且垂直于终点所在边的线与包围框线的交点
    let fakeEndPoint: Point | null = findStartNextOrEndPrePoint(rect2, endPoint);
    fakeEndPoint && points.push(fakeEndPoint);

    // 经过起点且垂直于起点所在边的线 与 经过终点且垂直于终点所在边的线 的交点
    let startEndPointVerticalLineIntersection;
    if (fakeEndPoint && fakeStartPoint) {
        startEndPointVerticalLineIntersection = getIntersection([startPoint, fakeStartPoint], [endPoint, fakeEndPoint]);
        startEndPointVerticalLineIntersection && points.push(startEndPointVerticalLineIntersection);
    }

    // 当 经过起点且垂直于起点所在边的线 与 经过终点且垂直于终点所在边的线 平行时，计算一条垂直线与经过另一个点的伪点的水平线 的节点
    if (!startEndPointVerticalLineIntersection && fakeEndPoint && fakeStartPoint) {
        let p1 = getIntersection(
            [startPoint, fakeStartPoint], // 假设经过起点的垂直线是垂直的
            [fakeEndPoint, [fakeEndPoint[0] + 10, fakeEndPoint[1]]] // 那么就要计算经过伪终点的水平线。水平线上的点y坐标相同，所以x坐标随便加减多少数值都可以
        );
        p1 && points.push(p1);
        let p2 = getIntersection(
            [startPoint, fakeStartPoint], // 假设经过起点的垂直线是水平的
            [fakeEndPoint, [fakeEndPoint[0], fakeEndPoint[1] + 10]] // 那么就要计算经过伪终点的垂直线。
        );
        p2 && points.push(p2);
        // 下面同上
        let p3 = getIntersection([endPoint, fakeEndPoint], [fakeStartPoint, [fakeStartPoint[0] + 10, fakeStartPoint[1]]]);
        p3 && points.push(p3);
        let p4 = getIntersection([endPoint, fakeEndPoint], [fakeStartPoint, [fakeStartPoint[0], fakeStartPoint[1] + 10]]);
        p4 && points.push(p4);
    }
    // 伪起点和伪终点形成的矩形 和 起点元素包围框 组成一个大矩形 的四个顶点
    points.push(
        ...getBoundingBox([
            // 伪起点终点
            fakeStartPoint as Point,
            fakeEndPoint as Point,
            // 起点元素包围框
            [startX - MIN_DISTANCE, startY - MIN_DISTANCE], // 左上顶点
            [startX + startWidth + MIN_DISTANCE, startY + startHeight + MIN_DISTANCE] // 右下顶点
        ])
    );

    // 伪起点和伪终点形成的矩形 和 终点元素包围框 组成一个大矩形 的四个顶点
    points.push(
        ...getBoundingBox([
            // 伪起点终点
            fakeStartPoint as Point,
            fakeEndPoint as Point,
            // 终点元素包围框
            [endX - MIN_DISTANCE, endY - MIN_DISTANCE], // 左上顶点
            [endX + endWidth + MIN_DISTANCE, endY + endHeight + MIN_DISTANCE] // 右下顶点
        ])
    );

    // 去重
    points = removeDuplicatePoint(points);

    return {
        startPoint,
        endPoint,
        fakeStartPoint,
        fakeEndPoint,
        points
    };
};

// 检查一个点是否在一条线段上
export const checkPointIsInSegment = (point: number[], seg: number[][]) => {
    if (point[0] === seg[0][0]) {
        if (point[1] >= Math.min(seg[0][1], seg[1][1]) && point[1] <= Math.max(seg[0][1], seg[1][1])) {
            return true;
        }
    } else if (point[1] === seg[0][1]) {
        if (point[0] >= Math.min(seg[0][0], seg[1][0]) && point[0] <= Math.max(seg[0][0], seg[1][0])) {
            return true;
        }
    }
    return false;
};

// 计算两条线段的交点
export const getIntersection = (seg1: Point[], seg2: Point[]) => {
    // 两条垂直线不会相交
    if (seg1[0][0] === seg1[1][0] && seg2[0][0] === seg2[1][0]) {
        return null;
    }
    // 两条水平线不会相交
    if (seg1[0][1] === seg1[1][1] && seg2[0][1] === seg2[1][1]) {
        return null;
    }
    // seg1是水平线、seg2是垂直线
    if (seg1[0][1] === seg1[1][1] && seg2[0][0] === seg2[1][0]) {
        return [seg2[0][0], seg1[0][1]] as Point;
    }
    // seg1是垂直线、seg2是水平线
    if (seg1[0][0] === seg1[1][0] && seg2[0][1] === seg2[1][1]) {
        return [seg1[0][0], seg2[0][1]] as Point;
    }
    return null;
};

// 找出起点的下一个点或终点的前一个点
export const findStartNextOrEndPrePoint = (rect: RectangleClient, point: Point) => {
    // 起点或终点在左边
    if (point[0] === rect.x) {
        return [rect.x - MIN_DISTANCE, rect.y + rect.height / 2] as Point;
    } else if (point[1] === rect.y) {
        // 起点或终点在上边
        return [point[0], rect.y - MIN_DISTANCE] as Point;
    } else if (point[0] === rect.x + rect.width) {
        // 起点或终点在右边
        return [rect.x + rect.width + MIN_DISTANCE, rect.y + rect.height / 2] as Point;
    } else if (point[1] === rect.y + rect.height) {
        // 起点或终点在下边
        return [point[0], rect.y + rect.height + MIN_DISTANCE] as Point;
    }
    return point;
};

// 计算出给定点可以形成的最大的矩形的四个顶点
export const getBoundingBox = (points: Point[]) => {
    let boundingBoxXList: number[] = [];
    let boundingBoxYList: number[] = [];
    points.forEach((item: Point) => {
        boundingBoxXList.push(item[0]);
        boundingBoxYList.push(item[1]);
    });
    let minBoundingBoxX = Math.min(...boundingBoxXList);
    let minBoundingBoxY = Math.min(...boundingBoxYList);
    let maxBoundingBoxX = Math.max(...boundingBoxXList);
    let maxBoundingBoxY = Math.max(...boundingBoxYList);
    return [
        [minBoundingBoxX, minBoundingBoxY],
        [maxBoundingBoxX, minBoundingBoxY],
        [minBoundingBoxX, maxBoundingBoxY],
        [maxBoundingBoxX, maxBoundingBoxY]
    ] as Point[];
};

// 找出一个点周边的点
export const getNextPoints = (point: Point, points: Point[]) => {
    let [x, y] = point;
    let xSamePoints: Point[] = [];
    let ySamePoints: Point[] = [];
    // 找出x或y坐标相同的点
    points.forEach((item: Point) => {
        // 跳过目标点
        if (checkIsSamePoint(point, item)) {
            return;
        }
        if (item[0] === x) {
            xSamePoints.push(item);
        }
        if (item[1] === y) {
            ySamePoints.push(item);
        }
    });

    // 找出x方向最近的点
    let xNextPoints = getNextPoint(x, y, ySamePoints, 'x');

    // 找出y方向最近的点
    let yNextPoints = getNextPoint(x, y, xSamePoints, 'y');

    return [...xNextPoints, ...yNextPoints];
};

// 找出水平或垂直方向上最近的点
export const getNextPoint = (x: number, y: number, list: Point[], dir: string) => {
    let index = dir === 'x' ? 0 : 1; // 求水平方向上最近的点，那么它们y坐标都是相同的，要比较x坐标，反之亦然
    let value = dir === 'x' ? x : y;
    let nextLeftTopPoint = null;
    let nextRIghtBottomPoint = null;
    for (let i = 0; i < list.length; i++) {
        let cur = list[i];
        // 检查当前点和目标点的连线是否穿过起终点元素，宽松模式下直接跳过该检测
        if (!easyMode && checkLineThroughElements([x, y], cur)) {
            continue;
        }
        // 左侧或上方最近的点
        if (cur[index] < value) {
            if (nextLeftTopPoint) {
                if (cur[index] > nextLeftTopPoint[index]) {
                    nextLeftTopPoint = cur;
                }
            } else {
                nextLeftTopPoint = cur;
            }
        }
        // 右侧或下方最近的点
        if (cur[index] > value) {
            if (nextRIghtBottomPoint) {
                if (cur[index] < nextRIghtBottomPoint[index]) {
                    nextRIghtBottomPoint = cur;
                }
            } else {
                nextRIghtBottomPoint = cur;
            }
        }
    }
    return [nextLeftTopPoint, nextRIghtBottomPoint].filter(point => {
        return !!point;
    });
};

// 检查两个点组成的线段是否穿过起终点元素
export const checkLineThroughElements = (a: Point, b: Point) => {
    let rects = [rect1, rect2];
    let minX = Math.min(a[0], b[0]);
    let maxX = Math.max(a[0], b[0]);
    let minY = Math.min(a[1], b[1]);
    let maxY = Math.max(a[1], b[1]);
    // 水平线
    if (a[1] === b[1]) {
        for (let i = 0; i < rects.length; i++) {
            let rect = rects[i];
            if (
                minY > rect.y - MIN_DISTANCE &&
                minY < rect.y + rect.height + MIN_DISTANCE &&
                minX < rect.x + rect.width + MIN_DISTANCE &&
                maxX > rect.x - MIN_DISTANCE
            ) {
                return true;
            }
        }
    } else if (a[0] === b[0]) {
        // 垂直线
        for (let i = 0; i < rects.length; i++) {
            let rect = rects[i];
            if (
                minX > rect.x - MIN_DISTANCE &&
                minX < rect.x + rect.width + MIN_DISTANCE &&
                minY < rect.y + rect.height + MIN_DISTANCE &&
                maxY > rect.y - MIN_DISTANCE
            ) {
                return true;
            }
        }
    }

    return false;
};

// 检测是否为同一个点
export const checkIsSamePoint = (a: Point, b: Point) => {
    if (!a || !b) {
        return false;
    }
    return a[0] === b[0] && a[1] === b[1];
};

// 去重
export const removeDuplicatePoint = (points: Point[]) => {
    let result: Point[] = [];
    let cache: { [key: string]: boolean } = {};
    points.forEach(([x, y]) => {
        if (cache[x + '-' + y]) {
            return;
        } else {
            cache[x + '-' + y] = true;
            result.push([x, y]);
        }
    });
    return result;
};
