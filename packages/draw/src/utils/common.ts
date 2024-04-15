import {
    ACTIVE_STROKE_WIDTH,
    addSelectedElement,
    Ancestor,
    BoardTransforms,
    clearSelectedElement,
    createG,
    depthFirstRecursion,
    drawCircle,
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
import { DefaultDrawStyle, LINE_HIT_GEOMETRY_BUFFER, LINE_SNAPPING_BUFFER, ShapeDefaultSpace } from '../constants';
import { DrawShapes, EngineExtraData, PlaitCommonGeometry, PlaitDrawElement, PlaitGeometry, PlaitShapeElement } from '../interfaces';
import { getTextEditors } from '@plait/common';
import { isCellIncludeText } from './table';
import { getHitConnectorPoint, getNearestPoint, isGeometryIncludeText, isHitEdgeOfShape, isInsideOfShape } from '.';
import { getEngine } from '../engines';
import { getElementShape } from './shape';
import { Options } from 'roughjs/bin/core';
import { PlaitTable } from '../interfaces/table';
import { memorizeLatestShape } from './memorize';

export const getTextRectangle = <T extends PlaitElement = PlaitGeometry>(element: T) => {
    const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
    const strokeWidth = getStrokeWidthByElement(element);
    const height = element.textHeight!;
    const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
    return {
        height,
        width: width > 0 ? width : 0,
        x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
        y: elementRectangle.y + (elementRectangle.height - height) / 2
    };
};

export const getStrokeWidthByElement = (element: PlaitElement) => {
    if (PlaitDrawElement.isText(element)) {
        return 0;
    }
    const strokeWidth = element.strokeWidth || DefaultDrawStyle.strokeWidth;
    return strokeWidth;
};

export const insertElement = (board: PlaitBoard, element: PlaitCommonGeometry | PlaitTable) => {
    memorizeLatestShape(board, element.shape);
    Transforms.insertNode(board, element, [board.children.length]);
    clearSelectedElement(board);
    addSelectedElement(board, element);
    BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
};

export const isDrawElementsIncludeText = (elements: PlaitDrawElement[]) => {
    return elements.some(item => {
        if (PlaitDrawElement.isText(item)) {
            return true;
        }
        if (PlaitDrawElement.isImage(item)) {
            return false;
        }
        if (PlaitDrawElement.isGeometry(item)) {
            return isGeometryIncludeText(item);
        }
        if (PlaitDrawElement.isLine(item)) {
            const editors = getTextEditors(item);
            return editors.length > 0;
        }
        if (PlaitDrawElement.isTable(item)) {
            return item.cells.some(cell => isCellIncludeText(cell));
        }
        return true;
    });
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
    const rotatedPoint = rotateAntiPointsByElement(point, hitElement) || point;
    const connectorPoint = getHitConnectorPoint(rotatedPoint, hitElement);
    const edgePoint = getNearestPoint(hitElement, rotatedPoint);
    const isHitEdge = isHitEdgeOfShape(board, hitElement, rotatedPoint, LINE_SNAPPING_BUFFER);
    return { isHitEdge, isHitConnector: !!connectorPoint, connectorPoint, edgePoint };
};

export const getHitShape = (board: PlaitBoard, point: Point, offset = LINE_HIT_GEOMETRY_BUFFER): PlaitShapeElement | null => {
    let hitShape: PlaitShapeElement | null = null;
    traverseDrawShapes(board, (element: PlaitShapeElement) => {
        if (hitShape === null && isInsideOfShape(board, element, rotateAntiPointsByElement(point, element) || point, offset * 2)) {
            hitShape = element;
        }
    });
    return hitShape;
};

export const traverseDrawShapes = (board: PlaitBoard, callback: (element: PlaitShapeElement) => void) => {
    depthFirstRecursion<Ancestor>(
        board,
        node => {
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
    drawOptions: EngineExtraData
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
    let drawOptions: EngineExtraData = {};
    if (PlaitDrawElement.isTable(element)) {
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
                fill: SELECTION_FILL_COLOR,
                fillStyle: 'solid'
            },
            drawOptions
        );
        g.appendChild(maskG);
    }
    if (roughOptions.hasConnector) {
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
