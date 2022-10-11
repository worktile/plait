import { MindmapNode } from '../interfaces/node';
import { Options } from 'roughjs/bin/core';
import { Point } from 'roughjs/bin/geometry';
import { RoughSVG } from 'roughjs/bin/svg';
import { MAX_RADIUS, MindmapNodeShape } from '../constants';
import { BaseCursorStatus, PlaitBoard } from '@plait/core';
import * as MindmapQueries from '../queries';
import { isHorizontalLayout, isIndentedLayout, MindmapLayoutType } from '@plait/layouts';
import { getNodeShapeByElement } from './shape';

export interface RectangleClient {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface EllipseClient {
    center: Point;
    width: number;
    height: number;
}

export function toRectangleClient(points: [Point, Point]): RectangleClient {
    const xArray = points.map(ele => ele[0]);
    const yArray = points.map(ele => ele[1]);
    const xMin = Math.min(...xArray);
    const xMax = Math.max(...xArray);
    const yMin = Math.min(...yArray);
    const yMax = Math.max(...yArray);
    const rect = { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin };
    return rect;
}

export function drawRoundRectangle(rs: RoughSVG, x1: number, y1: number, x2: number, y2: number, options: Options, outline = false) {
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);

    const defaultRadius = Math.min(width, height) / 8;
    let radius = defaultRadius;
    if (defaultRadius > MAX_RADIUS) {
        radius = outline ? MAX_RADIUS + 2 : MAX_RADIUS;
    }

    const point1 = [x1 + radius, y1];
    const point2 = [x2 - radius, y1];
    const point3 = [x2, y1 + radius];
    const point4 = [x2, y2 - radius];
    const point5 = [x2 - radius, y2];
    const point6 = [x1 + radius, y2];
    const point7 = [x1, y2 - radius];
    const point8 = [x1, y1 + radius];
    return rs.path(
        `M${point2[0]} ${point2[1]} A ${radius} ${radius}, 0, 0, 1, ${point3[0]} ${point3[1]} L ${point4[0]} ${point4[1]} A ${radius} ${radius}, 0, 0, 1, ${point5[0]} ${point5[1]} L ${point6[0]} ${point6[1]} A ${radius} ${radius}, 0, 0, 1, ${point7[0]} ${point7[1]} L ${point8[0]} ${point8[1]} A ${radius} ${radius}, 0, 0, 1, ${point1[0]} ${point1[1]} Z`,
        options
    );
}

export function getRectangleByNode(node: MindmapNode) {
    const x = node.x + node.hGap;
    let y = node.y + node.vGap;
    const width = node.width - node.hGap * 2;
    const height = node.height - node.vGap * 2;
    if (!node.origin.isRoot && (getNodeShapeByElement(node.origin) as MindmapNodeShape) === MindmapNodeShape.underline) {
        const layout = MindmapQueries.getLayoutByElement(node.parent.origin) as MindmapLayoutType;
        if (isHorizontalLayout(layout) && !isIndentedLayout(layout)) {
            y = y - height / 2;
        }
    }
    return {
        x,
        y,
        width,
        height
    };
}

export function hitMindmapNode(board: PlaitBoard, point: Point, node: MindmapNode) {
    if (board.cursor === BaseCursorStatus.move) return false;
    const { x, y, width, height } = getRectangleByNode(node);
    return point[0] >= x && point[0] <= x + width && point[1] >= y && point[1] <= y + height;
}
