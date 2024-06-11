import { PlaitBoard, PlaitElement, Point, RectangleClient, ThemeColorMode, getSelectedElements, idCreator } from '@plait/core';
import { GeometryShapes, BasicShapes, PlaitGeometry, FlowchartSymbols, UMLSymbols } from '../interfaces/geometry';
import { Element } from 'slate';
import {
    DefaultBasicShapeProperty,
    DefaultBasicShapePropertyMap,
    DefaultFlowchartPropertyMap,
    DefaultTextProperty,
    DefaultUMLPropertyMap,
    DrawPointerType,
    DrawThemeColors,
    GEOMETRY_WITHOUT_TEXT,
    ShapeDefaultSpace,
    getFlowchartPointers,
    getUMLPointers
} from '../constants';
import {
    ActiveGenerator,
    Alignment,
    CustomText,
    DEFAULT_FONT_FAMILY,
    PlaitCommonElementRef,
    RESIZE_HANDLE_DIAMETER,
    buildText,
    getFirstTextManage,
    measureElement
} from '@plait/common';
import { Options } from 'roughjs/bin/core';
import { getEngine } from '../engines';
import { getElementShape } from './shape';
import { createLineElement } from './line/line-basic';
import { LineMarkerType, LineShape, PlaitDrawElement, PlaitShapeElement } from '../interfaces';
import { DefaultLineStyle } from '../constants/line';
import { getMemorizedLatestByPointer } from './memorize';
import { PlaitDrawShapeText, getTextManage } from '../generators/text.generator';
import { createUMLClassOrInterfaceGeometryElement } from './uml';
import { createMultipleTextGeometryElement, isMultipleTextGeometry, isMultipleTextShape } from './multi-text-geometry';
import { DEFAULT_FONT_SIZE } from '@plait/text-plugins';

export type GeometryStyleOptions = Pick<PlaitGeometry, 'fill' | 'strokeColor' | 'strokeWidth'>;

export type TextProperties = Partial<CustomText> & { align?: Alignment; textHeight?: number };

export const createGeometryElement = (
    shape: GeometryShapes,
    points: [Point, Point],
    text: string | Element,
    options: GeometryStyleOptions = {},
    textProperties: TextProperties = {}
): PlaitGeometry => {
    if (GEOMETRY_WITHOUT_TEXT.includes(shape)) {
        return createGeometryElementWithoutText(shape, points, options);
    } else {
        return createGeometryElementWithText(shape, points, text, options, textProperties);
    }
};

export const createGeometryElementWithText = (
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

export const createGeometryElementWithoutText = (
    shape: GeometryShapes,
    points: [Point, Point],
    options: GeometryStyleOptions = {}
): PlaitGeometry => {
    return {
        id: idCreator(),
        type: 'geometry',
        shape,
        angle: 0,
        opacity: 1,
        points,
        ...options
    };
};

export const drawGeometry = (board: PlaitBoard, outerRectangle: RectangleClient, shape: GeometryShapes, roughOptions: Options) => {
    return getEngine(shape).draw(board, outerRectangle, roughOptions);
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

export const getDefaultUMLProperty = (shape: UMLSymbols) => {
    return DefaultUMLPropertyMap[shape];
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
    const textSize = measureElement(buildText(text), { fontSize, fontFamily: DEFAULT_FONT_FAMILY });
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
    const isUML = getUMLPointers().includes(pointer);
    if (isFlowChart) {
        return getDefaultFlowchartProperty(pointer as FlowchartSymbols);
    } else if (isUML) {
        return getDefaultUMLProperty(pointer as UMLSymbols);
    } else {
        return getDefaultBasicShapeProperty(pointer as BasicShapes);
    }
};

export const getDefaultTextPoints = (board: PlaitBoard, centerPoint: Point, fontSize?: number | string) => {
    const property = getTextShapeProperty(board, DefaultTextProperty.text, fontSize);
    return RectangleClient.getPoints(RectangleClient.getRectangleByCenterPoint(centerPoint, property.width, property.height));
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
    if (PlaitDrawElement.isUMLClassOrInterface({ shape })) {
        return createUMLClassOrInterfaceGeometryElement(board, shape, points);
    }
    if (isMultipleTextShape(shape)) {
        return createMultipleTextGeometryElement(shape, points, {
            strokeWidth: DefaultBasicShapeProperty.strokeWidth,
            ...(memorizedLatest.geometryProperties as GeometryStyleOptions)
        });
    } else {
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
    }
};

export const editText = (board: PlaitBoard, element: PlaitGeometry, text?: PlaitDrawShapeText) => {
    const textManage = text ? getTextManage(`${element.id}-${text.key}`)! : getFirstTextManage(element);
    if (textManage) {
        textManage.edit(() => {
            // delay to avoid blinking
            setTimeout(() => {
                rerenderGeometryActive(board, element);
            }, 200);
        });
    }

    rerenderGeometryActive(board, element);
};

export const rerenderGeometryActive = (board: PlaitBoard, element: PlaitGeometry) => {
    const elementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(element);
    const activeGenerator = elementRef.getGenerator(ActiveGenerator.key);
    const selected = getSelectedElements(board).includes(element);
    activeGenerator.processDrawing(element, PlaitBoard.getElementActiveHost(board), { selected });
};

export const isGeometryIncludeText = (element: PlaitGeometry) => {
    return isSingleTextGeometry(element) || isMultipleTextGeometry(element);
};

export const isSingleTextShape = (shape: GeometryShapes) => {
    return !GEOMETRY_WITHOUT_TEXT.includes(shape) && !isMultipleTextShape(shape);
};

export const isSingleTextGeometry = (element: PlaitGeometry) => {
    return PlaitDrawElement.isGeometry(element) && isSingleTextShape(element.shape);
};
