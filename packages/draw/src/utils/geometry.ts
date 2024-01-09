import {
    ACTIVE_STROKE_WIDTH,
    BoardTransforms,
    PlaitBoard,
    PlaitPointerType,
    Point,
    RectangleClient,
    SELECTION_BORDER_COLOR,
    SELECTION_FILL_COLOR,
    ThemeColorMode,
    Transforms,
    Vector,
    addSelectedElement,
    clearSelectedElement,
    createG,
    drawCircle,
    idCreator
} from '@plait/core';
import { GeometryShapes, BasicShapes, PlaitGeometry, FlowchartSymbols } from '../interfaces/geometry';
import { Alignment, CustomText, DEFAULT_FONT_SIZE, buildText, getTextSize } from '@plait/text';
import { Element } from 'slate';
import {
    DefaultBasicShapeProperty,
    DefaultFlowchartPropertyMap,
    DefaultTextProperty,
    DrawPointerType,
    DrawThemeColors,
    ShapeDefaultSpace,
    getFlowchartPointers
} from '../constants';
import { RESIZE_HANDLE_DIAMETER, getRectangleByPoints } from '@plait/common';
import { getStrokeWidthByElement } from './style/stroke';
import { Options } from 'roughjs/bin/core';
import { getEngine } from '../engines';
import { getShape } from './shape';
import { createLineElement } from './line';
import { LineMarkerType, LineShape, PlaitShape } from '../interfaces';
import { DefaultLineStyle } from '../constants/line';
import { getMemorizedLatestByPointer, memorizeLatestShape } from './memorize';

export type GeometryStyleOptions = Pick<PlaitGeometry, 'fill' | 'strokeColor' | 'strokeWidth'>;

export type TextProperties = Partial<CustomText> & { align?: Alignment; textHeight?: number };

export const createGeometryElement = (
    shape: GeometryShapes,
    points: [Point, Point],
    text: string | Element,
    options: GeometryStyleOptions = {},
    textProperties: TextProperties = {}
): PlaitGeometry => {
    let textOptions = {};
    let alignment: undefined | Alignment = Alignment.center;
    let textHeight = DefaultTextProperty.height;
    if (shape === BasicShapes.text) {
        textOptions = { autoSize: true };
        alignment = undefined;
    }
    textProperties = { ...textProperties };
    textProperties?.align && (alignment = textProperties?.align);
    textProperties?.textHeight && (textHeight = textProperties?.textHeight);
    delete textProperties?.align;
    delete textProperties?.textHeight;
    return {
        id: idCreator(),
        type: 'geometry',
        shape,
        angle: 0,
        opacity: 1,
        textHeight,
        text: buildText(text, alignment, textProperties),
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

export const getNearestPoint = (element: PlaitShape, point: Point) => {
    const rectangle = getRectangleByPoints(element.points);
    const shape = getShape(element);
    return getEngine(shape).getNearestPoint(rectangle, point);
};

export const getCenterPointsOnPolygon = (points: Point[]) => {
    const centerPoint: Point[] = [];
    for (let i = 0; i < points.length; i++) {
        let j = i == points.length - 1 ? 0 : i + 1;
        centerPoint.push([(points[i][0] + points[j][0]) / 2, (points[i][1] + points[j][1]) / 2]);
    }
    return centerPoint;
};

export const getDefaultFlowchartProperty = (symbol: FlowchartSymbols) => {
    return DefaultFlowchartPropertyMap[symbol];
};

export const createDefaultFlowchart = (point: Point) => {
    const decisionProperty = getDefaultFlowchartProperty(FlowchartSymbols.decision);
    const processProperty = getDefaultFlowchartProperty(FlowchartSymbols.process);
    const terminalProperty = getDefaultFlowchartProperty(FlowchartSymbols.terminal);

    const options = {
        strokeWidth: DefaultBasicShapeProperty.strokeWidth
    };

    const lineOptions = {
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

export const getAutoCompletePoints = (element: PlaitShape) => {
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

export const getDrawDefaultStrokeColor = (theme: ThemeColorMode) => {
    return DrawThemeColors[theme].strokeColor;
};

export const getFlowchartDefaultFill = (theme: ThemeColorMode) => {
    return DrawThemeColors[theme].fill;
};

export const getTextShapeProperty = (board: PlaitBoard, text: string | Element = DefaultTextProperty.text, fontSize?: number | string) => {
    fontSize = fontSize ? Number(fontSize) : DEFAULT_FONT_SIZE;
    const textSize = getTextSize(board, text, Infinity, { fontSize });
    return {
        width: textSize.width + ShapeDefaultSpace.rectangleAndText * 2,
        height: textSize.height
    };
};

export const getDefaultGeometryPoints = (pointer: DrawPointerType, centerPoint: Point) => {
    const defaultProperty = getDefaultGeometryProperty(pointer);
    return getPointsByCenterPoint(centerPoint, defaultProperty.width, defaultProperty.height);
};

export const getDefaultGeometryProperty = (pointer: DrawPointerType) => {
    const isFlowChart = getFlowchartPointers().includes(pointer);
    if (isFlowChart) {
        return getDefaultFlowchartProperty(pointer as FlowchartSymbols);
    } else {
        return DefaultBasicShapeProperty;
    }
};

export const getDefaultTextPoints = (board: PlaitBoard, centerPoint: Point, fontSize?: number | string) => {
    const property = getTextShapeProperty(board, DefaultTextProperty.text, fontSize);
    return getPointsByCenterPoint(centerPoint, property.width, property.height);
};

export const insertElement = (board: PlaitBoard, element: PlaitGeometry) => {
    memorizeLatestShape(board, element.shape);
    Transforms.insertNode(board, element, [board.children.length]);
    clearSelectedElement(board);
    addSelectedElement(board, element);
    BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
};

export const createTextElement = (
    board: PlaitBoard,
    points: [Point, Point],
    text: string | Element = DefaultTextProperty.text,
    textHeight?: number
) => {
    const memorizedLatest = getMemorizedLatestByPointer(BasicShapes.text);
    textHeight = textHeight ? textHeight : getRectangleByPoints(points).height;
    return createGeometryElement(BasicShapes.text, points, text, memorizedLatest.geometryProperties as GeometryStyleOptions, {
        ...memorizedLatest.textProperties,
        textHeight
    });
};

export const createDefaultGeometry = (board: PlaitBoard, points: [Point, Point], shape: GeometryShapes) => {
    const memorizedLatest = getMemorizedLatestByPointer(shape);
    const textHeight = getTextShapeProperty(board, DefaultTextProperty.text, memorizedLatest.textProperties['font-size']).height;
    return createGeometryElement(
        shape,
        points,
        '',
        {
            strokeWidth: DefaultBasicShapeProperty.strokeWidth,
            ...(memorizedLatest.geometryProperties as GeometryStyleOptions)
        },
        { ...memorizedLatest.textProperties, textHeight }
    );
};
