import {
    ACTIVE_STROKE_WIDTH,
    BoardTransforms,
    PlaitBoard,
    PlaitElement,
    PlaitPointerType,
    Point,
    RectangleClient,
    SELECTION_BORDER_COLOR,
    SELECTION_FILL_COLOR,
    SNAPPING_STROKE_WIDTH,
    ThemeColorMode,
    Transforms,
    addSelectedElement,
    clearSelectedElement,
    createG,
    drawCircle,
    getSelectedElements,
    idCreator
} from '@plait/core';
import { GeometryShapes, BasicShapes, PlaitGeometry, FlowchartSymbols } from '../interfaces/geometry';
import { Alignment, CustomText, DEFAULT_FONT_SIZE, buildText, getTextSize } from '@plait/text';
import { Element } from 'slate';
import {
    DefaultBasicShapeProperty,
    DefaultBasicShapePropertyMap,
    DefaultFlowchartPropertyMap,
    DefaultTextProperty,
    DrawPointerType,
    DrawThemeColors,
    ShapeDefaultSpace,
    getFlowchartPointers
} from '../constants';
import { ActiveGenerator, PlaitCommonElementRef, RESIZE_HANDLE_DIAMETER, getFirstTextManage } from '@plait/common';
import { getStrokeWidthByElement } from './style/stroke';
import { Options } from 'roughjs/bin/core';
import { getEngine } from '../engines';
import { getElementShape } from './shape';
import { createLineElement } from './line/line-basic';
import { LineMarkerType, LineShape, PlaitShapeElement } from '../interfaces';
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

export const getTextRectangle = (element: PlaitGeometry) => {
    const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
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

export const drawBoundReaction = (
    board: PlaitBoard,
    element: PlaitGeometry,
    options: { hasMask: boolean; hasConnector: boolean } = { hasMask: true, hasConnector: true }
) => {
    const g = createG();
    const rectangle = RectangleClient.getRectangleByPoints(element.points);
    const activeRectangle = RectangleClient.inflate(rectangle, SNAPPING_STROKE_WIDTH);
    const shape = getElementShape(element);
    const strokeG = drawGeometry(board, activeRectangle, shape, {
        stroke: SELECTION_BORDER_COLOR,
        strokeWidth: SNAPPING_STROKE_WIDTH
    });
    g.appendChild(strokeG);
    if (options.hasMask) {
        const maskG = drawGeometry(board, activeRectangle, shape, {
            stroke: SELECTION_BORDER_COLOR,
            strokeWidth: 0,
            fill: SELECTION_FILL_COLOR,
            fillStyle: 'solid'
        });
        g.appendChild(maskG);
    }
    if (options.hasConnector) {
        const connectorPoints = getEngine(shape).getConnectorPoints(rectangle);
        connectorPoints.forEach(point => {
            const circleG = drawCircle(PlaitBoard.getRoughSVG(board), point, 8, {
                stroke: SELECTION_BORDER_COLOR,
                strokeWidth: ACTIVE_STROKE_WIDTH,
                fill: '#FFF',
                fillStyle: 'solid'
            });
            g.appendChild(circleG);
        });
    }
    return g;
};

export const drawGeometry = (board: PlaitBoard, outerRectangle: RectangleClient, shape: GeometryShapes, options: Options) => {
    return getEngine(shape).draw(board, outerRectangle, options);
};

export const getNearestPoint = (element: PlaitShapeElement, point: Point) => {
    const rectangle = RectangleClient.getRectangleByPoints(element.points);
    const shape = getElementShape(element);
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

export const getDefaultBasicShapeProperty = (shape: BasicShapes) => {
    return DefaultBasicShapePropertyMap[shape] || DefaultBasicShapeProperty;
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
        '判断',
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

export const getAutoCompletePoints = (element: PlaitShapeElement) => {
    const AutoCompleteMargin = (12 + RESIZE_HANDLE_DIAMETER / 2) * 2;
    let rectangle = RectangleClient.getRectangleByPoints(element.points);
    rectangle = RectangleClient.inflate(rectangle, AutoCompleteMargin);
    return RectangleClient.getEdgeCenterPoints(rectangle);
};

export const getHitIndexOfAutoCompletePoint = (movingPoint: Point, points: Point[]) => {
    return points.findIndex(point => {
        const movingRectangle = RectangleClient.getRectangleByPoints([movingPoint]);
        let rectangle = RectangleClient.getRectangleByPoints([point]);
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
    const property = getDefaultGeometryProperty(pointer);
    return RectangleClient.getPoints(RectangleClient.getRectangleByCenterPoint(centerPoint, property.width, property.height));
};

export const getDefaultGeometryProperty = (pointer: DrawPointerType) => {
    const isFlowChart = getFlowchartPointers().includes(pointer);
    if (isFlowChart) {
        return getDefaultFlowchartProperty(pointer as FlowchartSymbols);
    } else {
        return getDefaultBasicShapeProperty(pointer as BasicShapes);
    }
};

export const getDefaultTextPoints = (board: PlaitBoard, centerPoint: Point, fontSize?: number | string) => {
    const property = getTextShapeProperty(board, DefaultTextProperty.text, fontSize);
    return RectangleClient.getPoints(RectangleClient.getRectangleByCenterPoint(centerPoint, property.width, property.height));
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
    textHeight = textHeight ? textHeight : RectangleClient.getRectangleByPoints(points).height;
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

export const editText = (board: PlaitBoard, element: PlaitGeometry) => {
    const textManage = getFirstTextManage(element);
    textManage.edit(() => {
        // delay to avoid blinking
        setTimeout(() => {
            rerenderGeometryActive(board, element);
        }, 200);
    });
    rerenderGeometryActive(board, element);
};

export const rerenderGeometryActive = (board: PlaitBoard, element: PlaitGeometry) => {
    const elementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(element);
    const activeGenerator = elementRef.getGenerator(ActiveGenerator.key);
    const selected = getSelectedElements(board).includes(element);
    activeGenerator.processDrawing(element, PlaitBoard.getElementActiveHost(board), { selected });
};
