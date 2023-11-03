import {
    ACTIVE_STROKE_WIDTH,
    PlaitBoard,
    Point,
    RectangleClient,
    SELECTION_BORDER_COLOR,
    SELECTION_FILL_COLOR,
    createG,
    distanceBetweenPointAndSegment,
    drawCircle,
    idCreator
} from '@plait/core';
import { GeometryShapes, BasicShapes, PlaitGeometry } from '../interfaces/geometry';
import { Alignment, buildText } from '@plait/text';
import { Element } from 'slate';
import { DefaultTextProperty, ShapeDefaultSpace } from '../constants';
import { getRectangleByPoints } from '@plait/common';
import { getStrokeWidthByElement } from './style/stroke';
import { Options } from 'roughjs/bin/core';
import { getEngine } from '../engines';
import { getShape } from './shape';

export const createGeometryElement = (
    shape: GeometryShapes,
    points: [Point, Point],
    text: string | Element,
    options?: Pick<PlaitGeometry, 'fill' | 'strokeColor' | 'strokeWidth'>
): PlaitGeometry => {
    let textOptions = {};
    let alignment: undefined | Alignment = Alignment.center;
    if (shape === BasicShapes.text) {
        textOptions = { autoSize: true };
        alignment = undefined;
    }

    return {
        id: idCreator(),
        type: 'geometry',
        shape,
        angle: 0,
        opacity: 1,
        textHeight: DefaultTextProperty.height,
        text: buildText(text, alignment),
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
    const strokeWidth = getStrokeWidthByElement(element);
    const height = element.textHeight;
    const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
    return {
        height,
        width: width > 0 ? width : 0,
        x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
        y: elementRectangle.y + (elementRectangle.height - height) / 2
    };
};

export const drawBoundMask = (board: PlaitBoard, element: PlaitGeometry) => {
    const G = createG();
    const rectangle = getRectangleByPoints(element.points);
    const activeRectangle = RectangleClient.inflate(rectangle, ACTIVE_STROKE_WIDTH);
    const shape = getShape(element);
    const maskG = drawGeometry(board, activeRectangle, shape, {
        stroke: SELECTION_BORDER_COLOR,
        strokeWidth: 1,
        fill: SELECTION_FILL_COLOR,
        fillStyle: 'solid'
    });
    G.appendChild(maskG);
    const connectorPoints = getEngine(shape).getConnectorPoints(activeRectangle);
    connectorPoints.forEach(point => {
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

export const drawGeometry = (board: PlaitBoard, outerRectangle: RectangleClient, shape: GeometryShapes, options: Options) => {
    return getEngine(shape).draw(board, outerRectangle, options);
};

export const getNearestPoint = (element: PlaitGeometry, point: Point, inflateDelta = 0) => {
    const rectangle = getRectangleByPoints(element.points);
    const activeRectangle = RectangleClient.inflate(rectangle, inflateDelta);
    const shape = getShape(element);
    return getEngine(shape).getNearestPoint(activeRectangle, point);
};

export const getCenterPointsOnPolygon = (points: Point[]) => {
    const centerPoint: Point[] = [];
    for (let i = 0; i < points.length; i++) {
        let j = i == points.length - 1 ? 0 : i + 1;
        centerPoint.push([(points[i][0] + points[j][0]) / 2, (points[i][1] + points[j][1]) / 2]);
    }
    return centerPoint;
};

export const getEdgeOnPolygonByPoint = (corners: Point[], point: Point) => {
    for (let index = 1; index <= corners.length; index++) {
        let start = corners[index - 1];
        let end = index === corners.length ? corners[0] : corners[index];
        const distance = distanceBetweenPointAndSegment(point[0], point[1], start[0], start[1], end[0], end[1]);
        if (distance < 1) {
            return [start, end] as [Point, Point];
        }
    }
    return null;
};
