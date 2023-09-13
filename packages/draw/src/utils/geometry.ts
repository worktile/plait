import {
    PlaitBoard,
    Point,
    RectangleClient,
    SELECTION_BORDER_COLOR,
    SELECTION_FILL_COLOR,
    createG,
    drawCircle,
    idCreator
} from '@plait/core';
import { GeometryShape, PlaitGeometry } from '../interfaces/geometry';
import { buildText } from '@plait/text';
import { Element } from 'slate';
import { DefaultTextProperty, ShapeDefaultSpace } from '../constants';
import { getRectangleByPoints } from '@plait/common';
import { getStrokeWidthByElement } from './geometry-style/stroke';
import { Options } from 'roughjs/bin/core';
import { getEngine } from './engine';

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
    const offset = (getStrokeWidthByElement(element) + 1) / 2 - 0.1;
    const activeRectangle = RectangleClient.getOutlineRectangle(rectangle, -offset);
    const maskG = drawGeometry(board, activeRectangle, element.shape, {
        stroke: SELECTION_BORDER_COLOR,
        strokeWidth: 1,
        fill: SELECTION_FILL_COLOR,
        fillStyle: 'solid'
    });
    G.appendChild(maskG);

    const connectorPoints = getEngine(element.shape).getConnectorPoints(activeRectangle);
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

export const drawGeometry = (board: PlaitBoard, outerRectangle: RectangleClient, shape: GeometryShape, options: Options) => {
    return getEngine(shape).draw(board, outerRectangle, options);
};

export const getNearestPoint = (element: PlaitGeometry, point: Point, offset = 0) => {
    const rectangle = getRectangleByPoints(element.points);
    const activeRectangle = RectangleClient.getOutlineRectangle(rectangle, -offset);
    return getEngine(element.shape).getNearestPoint(activeRectangle, point);
};

export const getCenterPointsOnPolygon = (points: Point[]) => {
    const centerPoint: Point[] = [];
    for (let i = 0; i < points.length; i++) {
        let j = i == points.length - 1 ? 0 : i + 1;
        centerPoint.push([(points[i][0] + points[j][0]) / 2, (points[i][1] + points[j][1]) / 2]);
    }
    return centerPoint;
};
