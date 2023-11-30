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
import { GeometryShapes, BasicShapes, PlaitGeometry, FlowchartSymbols } from '../interfaces/geometry';
import { Alignment, buildText } from '@plait/text';
import { Element } from 'slate';
import {
    DefaultBasicShapeProperty,
    DefaultFlowchartPropertyMap,
    DefaultTextProperty,
    ShapeDefaultSpace,
    getFlowchartPointers
} from '../constants';
import { RESIZE_HANDLE_DIAMETER, getRectangleByPoints } from '@plait/common';
import { getStrokeWidthByElement } from './style/stroke';
import { Options } from 'roughjs/bin/core';
import { getEngine } from '../engines';
import { getShape } from './shape';
import { getDefaultGeometryPoints } from '../plugins/with-geometry-create';
import { createLineElement } from './line';
import { LineMarkerType, LineShape } from '../interfaces';
import { DefaultLineStyle } from '../constants/line';

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

    let flowchartOptions = {};
    if (getFlowchartPointers().includes(shape)) {
        flowchartOptions = { fill: '#ffffff' };
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
        ...options,
        ...flowchartOptions
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

export const getDefaultFlowchartProperty = (symbol: FlowchartSymbols) => {
    return DefaultFlowchartPropertyMap[symbol];
};

export const createDefaultFlowchart = (point: Point) => {
    const decisionProperty = getDefaultFlowchartProperty(FlowchartSymbols.decision);
    const processProperty = getDefaultFlowchartProperty(FlowchartSymbols.process);
    const terminalProperty = getDefaultFlowchartProperty(FlowchartSymbols.terminal);

    const options = {
        strokeColor: DefaultBasicShapeProperty.strokeColor,
        strokeWidth: DefaultBasicShapeProperty.strokeWidth
    };

    const lineOptions = {
        strokeColor: DefaultLineStyle.strokeColor,
        strokeWidth: DefaultLineStyle.strokeWidth
    };
    const startElement = createGeometryElement(
        FlowchartSymbols.terminal,
        getDefaultGeometryPoints(FlowchartSymbols.terminal, point),
        '开始',
        options
    );

    const processPoint1: Point = [point[0], point[1] + terminalProperty.height / 2 + 55 + processProperty.height / 2];
    const processElement1 = createGeometryElement(
        FlowchartSymbols.process,
        getDefaultGeometryPoints(FlowchartSymbols.process, processPoint1),
        '过程',
        options
    );

    const decisionPoint: Point = [processPoint1[0], processPoint1[1] + processProperty.height / 2 + 55 + decisionProperty.height / 2];
    const decisionElement = createGeometryElement(
        FlowchartSymbols.decision,
        getDefaultGeometryPoints(FlowchartSymbols.decision, decisionPoint),
        '过程',
        options
    );

    const processPoint2: Point = [decisionPoint[0] + decisionProperty.width / 2 + 75 + processProperty.width / 2, decisionPoint[1]];
    const processElement2 = createGeometryElement(
        FlowchartSymbols.process,
        getDefaultGeometryPoints(FlowchartSymbols.process, processPoint2),
        '过程',
        options
    );

    const endPoint: Point = [decisionPoint[0], decisionPoint[1] + decisionProperty.height / 2 + 95 + terminalProperty.height / 2];
    const endElement = createGeometryElement(
        FlowchartSymbols.terminal,
        getDefaultGeometryPoints(FlowchartSymbols.terminal, endPoint),
        '结束',
        options
    );

    const line1 = createLineElement(
        LineShape.elbow,
        [
            [0, 0],
            [0, 0]
        ],
        { marker: LineMarkerType.none, connection: [0.5, 1], boundId: startElement.id },
        { marker: LineMarkerType.arrow, connection: [0.5, 0], boundId: processElement1.id },
        [],
        lineOptions
    );

    const line2 = createLineElement(
        LineShape.elbow,
        [
            [0, 0],
            [0, 0]
        ],
        { marker: LineMarkerType.none, connection: [0.5, 1], boundId: processElement1.id },
        { marker: LineMarkerType.arrow, connection: [0.5, 0], boundId: decisionElement.id },
        [],
        lineOptions
    );

    const line3 = createLineElement(
        LineShape.elbow,
        [
            [0, 0],
            [0, 0]
        ],
        { marker: LineMarkerType.none, connection: [0.5, 1], boundId: decisionElement.id },
        { marker: LineMarkerType.arrow, connection: [0.5, 0], boundId: endElement.id },
        [
            {
                text: buildText('是'),
                position: 0.5,
                width: 14,
                height: 20
            }
        ],
        lineOptions
    );

    const line4 = createLineElement(
        LineShape.elbow,
        [
            [0, 0],
            [0, 0]
        ],
        { marker: LineMarkerType.none, connection: [1, 0.5], boundId: decisionElement.id },
        { marker: LineMarkerType.arrow, connection: [0, 0.5], boundId: processElement2.id },
        [
            {
                text: buildText('否'),
                position: 0.5,
                width: 14,
                height: 20
            }
        ],
        lineOptions
    );

    const line5 = createLineElement(
        LineShape.elbow,
        [
            [0, 0],
            [0, 0]
        ],
        { marker: LineMarkerType.none, connection: [0.5, 1], boundId: processElement2.id },
        { marker: LineMarkerType.arrow, connection: [1, 0.5], boundId: endElement.id },
        [],
        lineOptions
    );

    return [startElement, processElement1, decisionElement, processElement2, endElement, line1, line2, line3, line4, line5];
};

export const getAutoCompletePoints = (element: PlaitGeometry) => {
    const AutoCompleteMargin = (12 + RESIZE_HANDLE_DIAMETER / 2) * 2;
    let rectangle = getRectangleByPoints(element.points);
    rectangle = RectangleClient.inflate(rectangle, AutoCompleteMargin);
    return RectangleClient.getEdgeCenterPoints(rectangle);
};

export const getHitIndexOfAutoCompletePoint = (movingPoint: Point, points: Point[]) => {
    return points.findIndex(point => {
        const movingRectangle = RectangleClient.toRectangleClient([movingPoint]);
        let rectangle = RectangleClient.toRectangleClient([point]);
        rectangle = RectangleClient.inflate(rectangle, RESIZE_HANDLE_DIAMETER);
        return RectangleClient.isHit(movingRectangle, rectangle);
    });
};
