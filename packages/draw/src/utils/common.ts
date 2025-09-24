import {
    ACTIVE_STROKE_WIDTH,
    addSelectedElement,
    Ancestor,
    BoardTransforms,
    clearSelectedElement,
    createG,
    depthFirstRecursion,
    drawCircle,
    getI18nValue,
    getIsRecursionFunc,
    PlaitBoard,
    PlaitElement,
    PlaitPointerType,
    Point,
    RectangleClient,
    rotateAntiPointsByElement,
    SELECTION_BORDER_COLOR,
    SELECTION_FILL_COLOR,
    SNAPPING_STROKE_WIDTH,
    Transforms
} from '@plait/core';
import {
    DefaultDrawStyle,
    DefaultTextProperty,
    DrawI18nKey,
    GeometryThreshold,
    LINE_HIT_GEOMETRY_BUFFER,
    LINE_SNAPPING_BUFFER,
    ShapeDefaultSpace
} from '../constants';
import {
    DrawOptions,
    DrawShapes,
    GeometryCommonTextKeys,
    PlaitBaseGeometry,
    PlaitCommonGeometry,
    PlaitCustomGeometry,
    PlaitDrawElement,
    PlaitGeometry,
    PlaitShapeElement,
    PlaitText
} from '../interfaces';
import { Alignment, getTextEditorsByElement } from '@plait/common';
import { isCellIncludeText } from './table';
import { getEngine } from '../engines';
import { getElementShape } from './shape';
import { Options } from 'roughjs/bin/core';
import { PlaitBaseTable } from '../interfaces/table';
import { memorizeLatestShape } from './memorize';
import { isHitEdgeOfShape, isInsideOfShape } from './hit';
import { getHitConnectorPoint } from './arrow-line';
import { getNearestPoint, isGeometryClosed, isGeometryIncludeText, isSingleTextGeometry } from './geometry';
import { isMultipleTextGeometry } from './multi-text-geometry';
import { DrawTextInfo } from '../generators/text.generator';
import { getTextSize } from './text-size';

export const getTextRectangle = <T extends PlaitElement = PlaitGeometry>(board: PlaitBoard, element: T) => {
    const isAutoSize = PlaitDrawElement.isText(element) ? element.autoSize : false;
    const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
    const strokeWidth = getStrokeWidthByElement(element);
    const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
    const textSize = getTextSize(board, element.text, isAutoSize ? GeometryThreshold.defaultTextMaxWidth : width);
    if (isAutoSize) {
        return {
            height: textSize.height,
            width: textSize.width,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
            y: elementRectangle.y + (elementRectangle.height - textSize.height) / 2
        };
    }
    return {
        height: textSize.height,
        width: width > 0 ? width : 0,
        x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
        y: elementRectangle.y + (elementRectangle.height - textSize.height) / 2
    };
};

export const getStrokeWidthByElement = (element: PlaitElement) => {
    if (PlaitDrawElement.isText(element)) {
        return 0;
    }
    const strokeWidth = element.strokeWidth || DefaultDrawStyle.strokeWidth;
    return strokeWidth;
};

export const insertElement = (board: PlaitBoard, element: PlaitBaseGeometry | PlaitBaseTable) => {
    memorizeLatestShape(board, element.shape);
    Transforms.insertNode(board, element, [board.children.length]);
    clearSelectedElement(board);
};

export const isDrawElementIncludeText = (element: PlaitDrawElement) => {
    if (PlaitDrawElement.isText(element)) {
        return true;
    }
    if (PlaitDrawElement.isImage(element)) {
        return false;
    }
    if (PlaitDrawElement.isGeometry(element)) {
        return isGeometryIncludeText(element);
    }
    if (PlaitDrawElement.isArrowLine(element)) {
        const editors = getTextEditorsByElement(element);
        return editors.length > 0;
    }
    if (PlaitDrawElement.isElementByTable(element)) {
        return element.cells.some((cell) => isCellIncludeText(cell));
    }
    return true;
};

export const isDrawElementsIncludeText = (elements: PlaitDrawElement[]) => {
    return elements.some((item) => {
        return isDrawElementIncludeText(item);
    });
};

export const isClosedDrawElement = (element: PlaitElement) => {
    if (PlaitDrawElement.isDrawElement(element)) {
        if (PlaitDrawElement.isText(element) || PlaitDrawElement.isArrowLine(element) || PlaitDrawElement.isImage(element)) {
            return false;
        }
        if (PlaitDrawElement.isVectorLine(element)) {
            return isClosedPoints(element.points);
        }
        if (PlaitDrawElement.isGeometry(element)) {
            return isGeometryClosed(element);
        }
        return true;
    }
    return false;
};

export const isClosedCustomGeometry = (board: PlaitBoard, value: PlaitElement): value is PlaitCustomGeometry => {
    return PlaitDrawElement.isCustomGeometryElement(board, value) && isClosedPoints(value.points);
};

export const getSnappingShape = (board: PlaitBoard, point: Point): PlaitShapeElement | null => {
    let hitElement: PlaitShapeElement | null = getHitShape(board, point);
    if (hitElement) {
        const ref = getSnappingRef(board, hitElement, point);
        if (ref.isHitConnector || ref.isHitEdge) {
            return hitElement;
        }
    }
    return null;
};

export const getSnappingRef = (board: PlaitBoard, hitElement: PlaitShapeElement, point: Point) => {
    const rotatedPoint = rotateAntiPointsByElement(board, point, hitElement) || point;
    const connectorPoint = getHitConnectorPoint(rotatedPoint, hitElement);
    const edgePoint = getNearestPoint(hitElement, rotatedPoint);
    const isHitEdge = isHitEdgeOfShape(board, hitElement, rotatedPoint, LINE_SNAPPING_BUFFER);
    return { isHitEdge, isHitConnector: !!connectorPoint, connectorPoint, edgePoint };
};

export const getHitShape = (board: PlaitBoard, point: Point, offset = LINE_HIT_GEOMETRY_BUFFER): PlaitShapeElement | null => {
    let hitShape: PlaitShapeElement | null = null;
    traverseDrawShapes(board, (element: PlaitShapeElement) => {
        if (hitShape === null && isInsideOfShape(board, element, rotateAntiPointsByElement(board, point, element) || point, offset * 2)) {
            hitShape = element;
        }
    });
    return hitShape;
};

export const traverseDrawShapes = (board: PlaitBoard, callback: (element: PlaitShapeElement) => void) => {
    depthFirstRecursion<Ancestor>(
        board,
        (node) => {
            if (!PlaitBoard.isBoard(node) && PlaitDrawElement.isShapeElement(node)) {
                callback(node);
            }
        },
        getIsRecursionFunc(board),
        true
    );
};

export const drawShape = (
    board: PlaitBoard,
    outerRectangle: RectangleClient,
    shape: DrawShapes,
    roughOptions: Options,
    drawOptions?: DrawOptions
) => {
    return getEngine(shape).draw(board, outerRectangle, roughOptions, drawOptions);
};

export const drawBoundReaction = (
    board: PlaitBoard,
    element: PlaitShapeElement,
    roughOptions: { hasMask: boolean; hasConnector: boolean } = { hasMask: true, hasConnector: true }
) => {
    const g = createG();
    const rectangle = RectangleClient.getRectangleByPoints(element.points);
    const activeRectangle = RectangleClient.inflate(rectangle, SNAPPING_STROKE_WIDTH);
    const shape = getElementShape(element);
    let drawOptions: DrawOptions | undefined;
    if (PlaitDrawElement.isElementByTable(element)) {
        drawOptions = { element };
    }
    const strokeG = drawShape(
        board,
        activeRectangle,
        shape,
        {
            stroke: SELECTION_BORDER_COLOR,
            strokeWidth: SNAPPING_STROKE_WIDTH
        },
        drawOptions
    );
    g.appendChild(strokeG);

    if (roughOptions.hasMask) {
        const maskG = drawShape(
            board,
            activeRectangle,
            shape,
            {
                stroke: SELECTION_BORDER_COLOR,
                strokeWidth: 0,
                fill: isClosedDrawElement(element) ? SELECTION_FILL_COLOR : DefaultDrawStyle.fill,
                fillStyle: 'solid'
            },
            drawOptions
        );
        g.appendChild(maskG);
    }
    if (roughOptions.hasConnector) {
        const connectorPoints = getEngine(shape).getConnectorPoints(rectangle);
        connectorPoints.forEach((point) => {
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

export const getTextKey = (element: PlaitElement | undefined, text: Pick<DrawTextInfo, 'id'>) => {
    if (element && isMultipleTextGeometry(element)) {
        return `${element.id}-${text.id}`;
    } else {
        return text.id;
    }
};

export const getGeometryAlign = (board: PlaitBoard, element: PlaitCommonGeometry | PlaitBaseTable) => {
    if (isMultipleTextGeometry(element)) {
        const drawShapeText = element.texts.find((item) => item.id.includes(GeometryCommonTextKeys.content));
        return drawShapeText?.text.align || Alignment.center;
    }
    if (isSingleTextGeometry(element as PlaitCommonGeometry)) {
        return (element as PlaitGeometry).text?.align || Alignment.center;
    }

    if (PlaitDrawElement.isElementByTable(element)) {
        const firstTextCell = element.cells.find((item) => item.text);
        return firstTextCell?.text?.align || Alignment.center;
    }
    return Alignment.center;
};

export const isClosedPoints = (points: Point[]) => {
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    return startPoint[0] === endPoint[0] && startPoint[1] === endPoint[1];
};

export const getDefaultGeometryText = (board: PlaitBoard) => {
    return getI18nValue(board, DrawI18nKey.geometryText, DefaultTextProperty.text);
};
