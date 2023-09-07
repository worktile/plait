import {
    PlaitBoard,
    Point,
    RectangleClient,
    SELECTION_BORDER_COLOR,
    SELECTION_FILL_COLOR,
    createG,
    drawCircle,
    drawRoundRectangle,
    getNearestPointBetweenPointAndSegments,
    idCreator
} from '@plait/core';
import { GeometryShape, PlaitGeometry } from '../interfaces/geometry';
import { buildText } from '@plait/text';
import { Element } from 'slate';
import { DefaultTextProperty, ShapeDefaultSpace } from '../constants';
import { drawRectangle, getRectangleByPoints } from '@plait/common';
import { getStrokeWidthByElement } from './geometry-style/stroke';
import { Options } from 'roughjs/bin/core';
import { getHitEdgeCenterPoint } from './line';

export const createGeometryElement = (
    shape: GeometryShape,
    points: [Point, Point],
    text: string | Element,
    options?: Pick<PlaitGeometry, 'fill' | 'strokeColor' | 'strokeWidth'>
): PlaitGeometry => {
    let textOptions = {};
    if (shape === GeometryShape.text) {
        textOptions = { autoSize: true };
    }

    return {
        id: idCreator(),
        type: 'geometry',
        shape,
        angle: 0,
        opacity: 1,
        textHeight: DefaultTextProperty.height,
        text: buildText(text),
        points,
        ...textOptions,
        ...options
    };
};

export const getPointsByCenterPoint = (point: Point, width: number, height: number): [Point, Point] => {
    const leftTopPoint: Point = [point[0] - width / 2, point[1] - height / 2];
    const rightBottomPoint: Point = [point[0] + width / 2, point[1] + height / 2];

    return [leftTopPoint, rightBottomPoint];
};

export const getTextRectangle = (element: PlaitGeometry) => {
    const elementRectangle = getRectangleByPoints(element.points!);
    const height = element.textHeight;
    const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2;

    return {
        height,
        width: width > 0 ? width : 0,
        x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText,
        y: elementRectangle.y + (elementRectangle.height - height) / 2
    };
};

export const drawBoundMask = (board: PlaitBoard, element: PlaitGeometry) => {
    const G = createG();
    const rectangle = getRectangleByPoints(element.points);
    const offset = (getStrokeWidthByElement(board, element) + 1) / 2 - 0.1;
    const activeRectangle = RectangleClient.getOutlineRectangle(rectangle, -offset);
    const maskG = drawGeometry(board, activeRectangle, element.shape, {
        stroke: SELECTION_BORDER_COLOR,
        strokeWidth: 1,
        fill: SELECTION_FILL_COLOR,
        fillStyle: 'solid'
    });
    G.appendChild(maskG);

    const lineCenterPoints = RectangleClient.getEdgeCenterPoints(activeRectangle);
    lineCenterPoints.forEach(point => {
        const circleG = drawCircle(PlaitBoard.getRoughSVG(board), point, 6, {
            stroke: '#999999',
            strokeWidth: 1,
            fill: '#FFF',
            fillStyle: 'solid'
        });
        G.appendChild(circleG);
    });

    return G;
};

export const drawDiamond = (board: PlaitBoard, rectangle: RectangleClient, options: Options) => {
    const points = RectangleClient.getEdgeCenterPoints(rectangle);
    const rs = PlaitBoard.getRoughSVG(board);
    return rs.polygon(points, { ...options, fillStyle: 'solid' });
};

export const drawParallelogram = (board: PlaitBoard, rectangle: RectangleClient, options: Options) => {
    const points = getParallelogramPoints(rectangle);
    const rs = PlaitBoard.getRoughSVG(board);
    return rs.polygon(points, { ...options, fillStyle: 'solid' });
};

export const drawEllipse = (board: PlaitBoard, rectangle: RectangleClient, options: Options) => {
    const centerPoint = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2];
    const rs = PlaitBoard.getRoughSVG(board);
    return rs.ellipse(centerPoint[0], centerPoint[1], rectangle.width, rectangle.height, { ...options, fillStyle: 'solid' });
};

export const drawGeometry = (board: PlaitBoard, outerRectangle: RectangleClient, shape: GeometryShape, options: Options) => {
    switch (shape) {
        case GeometryShape.rectangle:
            return drawRectangle(board, outerRectangle, options);
        case GeometryShape.roundRectangle:
            return drawRoundRectangle(
                PlaitBoard.getRoughSVG(board),
                outerRectangle.x,
                outerRectangle.y,
                outerRectangle.x + outerRectangle.width,
                outerRectangle.y + outerRectangle.height,
                options,
                false,
                getRoundRectangleRadius(outerRectangle)
            );
        case GeometryShape.diamond:
            return drawDiamond(board, outerRectangle, options);
        case GeometryShape.ellipse:
            return drawEllipse(board, outerRectangle, options);
        case GeometryShape.parallelogram:
            return drawParallelogram(board, outerRectangle, options);
        default:
            throw new Error(`Cannot draw ${shape}`);
    }
};

export const getRoundRectangleRadius = (rectangle: RectangleClient) => {
    return Math.min(rectangle.width * 0.1, rectangle.height * 0.1);
};

export const getParallelogramPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 4, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height]
    ];
};

export const normalizeHoverPoint = (element: PlaitGeometry, point: Point, offset = 0) => {
    const shape = element.shape;
    const rectangle = getRectangleByPoints(element.points);
    const activeRectangle = RectangleClient.getOutlineRectangle(rectangle, -offset);

    switch (shape) {
        case GeometryShape.rectangle:
        default:
            const activeRectangleCornerPoints = RectangleClient.getCornerPoints(activeRectangle);
            let nearestPoint = getNearestPointBetweenPointAndSegments(point, activeRectangleCornerPoints);
            const activePoint = getHitEdgeCenterPoint(nearestPoint, activeRectangle);
            return activePoint ? activePoint : nearestPoint;
        case GeometryShape.diamond:
            const diamondControlPoints = RectangleClient.getEdgeCenterPoints(activeRectangle);
            const diamondNearestPoint = getNearestPointBetweenPointAndSegments(point, diamondControlPoints);
            const diamondActivePoint = getHitEdgeCenterPoint(diamondNearestPoint, activeRectangle);
            return diamondActivePoint ? diamondActivePoint : diamondNearestPoint;
        case GeometryShape.ellipse:
            const ellipseNearestPoint = getNearestPointBetweenPointAndEllipse(
                point,
                [activeRectangle.x + activeRectangle.width / 2, activeRectangle.y + activeRectangle.height / 2],
                activeRectangle.width / 2,
                activeRectangle.height / 2
            );
            const ellipseActivePoint = getHitEdgeCenterPoint(ellipseNearestPoint, activeRectangle);
            return ellipseActivePoint ? ellipseActivePoint : ellipseNearestPoint;

        case GeometryShape.roundRectangle:
            let roundRectangleNearestPoint = getNearestPointBetweenPointAndRoundRectangle(
                point,
                activeRectangle,
                getRoundRectangleRadius(activeRectangle)
            );
            const roundRectangleActivePoint = getHitEdgeCenterPoint(roundRectangleNearestPoint, activeRectangle);
            return roundRectangleActivePoint ? roundRectangleActivePoint : roundRectangleNearestPoint;
    }
};

function getNearestPointBetweenPointAndEllipse(point: Point, center: Point, rx: number, ry: number, rotation: number = 0): Point {
    const rectangleClient = {
        x: center[0] - rx,
        y: center[1] - ry,
        height: ry * 2,
        width: rx * 2
    };
    // https://stackoverflow.com/a/46007540/232122
    const px = Math.abs(point[0] - rectangleClient.x - rectangleClient.width / 2);
    const py = Math.abs(point[1] - rectangleClient.y - rectangleClient.height / 2);

    let tx = 0.707;
    let ty = 0.707;

    const a = Math.abs(rectangleClient.width) / 2;
    const b = Math.abs(rectangleClient.height) / 2;

    [0, 1, 2, 3].forEach(x => {
        const xx = a * tx;
        const yy = b * ty;

        const ex = ((a * a - b * b) * tx ** 3) / a;
        const ey = ((b * b - a * a) * ty ** 3) / b;

        const rx = xx - ex;
        const ry = yy - ey;

        const qx = px - ex;
        const qy = py - ey;

        const r = Math.hypot(ry, rx);
        const q = Math.hypot(qy, qx);

        tx = Math.min(1, Math.max(0, ((qx * r) / q + ex) / a));
        ty = Math.min(1, Math.max(0, ((qy * r) / q + ey) / b));
        const t = Math.hypot(ty, tx);
        tx /= t;
        ty /= t;
    });
    const signX = point[0] > center[0] ? 1 : -1;
    const signY = point[1] > center[1] ? 1 : -1;

    return [center[0] + a * tx * signX, center[1] + b * ty * signY];
}

function getNearestPointBetweenPointAndRoundRectangle(point: Point, rectangle: RectangleClient, radius: number) {
    const { x: rectX, y: rectY, width, height } = rectangle;
    const cornerPoints = RectangleClient.getCornerPoints(rectangle);
    let result = getNearestPointBetweenPointAndSegments(point, cornerPoints);
    let circleCenter: Point | null = null;

    const inLeftTop = point[0] >= rectX && point[0] <= rectX + radius && point[1] >= rectY && point[1] <= rectY + radius;
    if (inLeftTop) {
        circleCenter = [rectX + radius, rectY + radius];
    }
    const inLeftBottom =
        point[0] >= rectX && point[0] <= rectX + radius && point[1] >= rectY + height && point[1] <= rectY + height - radius;
    if (inLeftBottom) {
        circleCenter = [rectX + radius, rectY + height - radius];
    }
    const inRightTop = point[0] >= rectX + width - radius && point[0] <= rectX + width && point[1] >= rectY && point[1] <= rectY + radius;
    if (inRightTop) {
        circleCenter = [rectX + width - radius, rectY + radius];
    }
    const inRightBottom =
        point[0] >= rectX + width - radius &&
        point[0] <= rectX + width &&
        point[1] >= rectY + height - radius &&
        point[1] <= rectY + height;
    if (inRightBottom) {
        circleCenter = [rectX + width - radius, rectY + height - radius];
    }
    if (circleCenter) {
        result = getNearestPointBetweenPointAndEllipse(point, circleCenter, radius, radius);
    }
    return result;
}
