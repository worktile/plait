import { Path, PlaitBoard, PlaitElement, PointOfRectangle, Transforms, findElements } from '@plait/core';
import {
    ArrowLineHandle,
    ArrowLineHandleKey,
    ArrowLineMarkerType,
    ArrowLineText,
    MemorizeKey,
    PlaitArrowLine,
    PlaitShapeElement
} from '../interfaces';
import { memorizeLatest } from '@plait/common';
import { getSelectedArrowLineElements } from '../utils/selected';
import { getHitConnection } from '../utils/arrow-line/arrow-line-basic';

export const resizeArrowLine = (board: PlaitBoard, options: Partial<PlaitArrowLine>, path: Path) => {
    Transforms.setNode(board, options, path);
};

export const setArrowLineTexts = (board: PlaitBoard, element: PlaitArrowLine, texts: ArrowLineText[]) => {
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, { texts }, path);
};

export const removeArrowLineText = (board: PlaitBoard, element: PlaitArrowLine, index: number) => {
    const path = PlaitBoard.findPath(board, element);
    const texts = element.texts?.length ? [...element.texts] : [];
    const newTexts = [...texts];
    newTexts.splice(index, 1);
    Transforms.setNode(board, { texts: newTexts }, path);
};

export const setArrowLineMark = (board: PlaitBoard, handleKey: ArrowLineHandleKey, marker: ArrowLineMarkerType) => {
    memorizeLatest(MemorizeKey.arrowLine, handleKey, marker);
    const selectedElements = getSelectedArrowLineElements(board);
    selectedElements.forEach((element: PlaitArrowLine) => {
        const path = PlaitBoard.findPath(board, element);
        let handle = handleKey === ArrowLineHandleKey.source ? element.source : element.target;
        handle = { ...handle, marker };
        Transforms.setNode(board, { [handleKey]: handle }, path);
    });
};

export const setArrowLineShape = (board: PlaitBoard, newProperties: Partial<PlaitArrowLine>) => {
    const elements = getSelectedArrowLineElements(board);
    elements.map(element => {
        const _properties = { ...newProperties };
        if (element.shape === newProperties.shape) {
            return;
        }
        const path = PlaitBoard.findPath(board, element);
        Transforms.setNode(board, _properties, path);
    });
};

export const connectArrowLineToDraw = (
    board: PlaitBoard,
    lineElement: PlaitArrowLine,
    handle: ArrowLineHandleKey,
    geometryElement: PlaitShapeElement
) => {
    const linePoints = PlaitArrowLine.getPoints(board, lineElement);
    const point = handle === ArrowLineHandleKey.source ? linePoints[0] : linePoints[linePoints.length - 1];
    const connection: PointOfRectangle = getHitConnection(board, point, geometryElement);
    if (connection) {
        let source: ArrowLineHandle = lineElement.source;
        let target: ArrowLineHandle = lineElement.target;
        if (handle === ArrowLineHandleKey.source) {
            source = {
                ...source,
                boundId: geometryElement.id,
                connection
            };
        } else {
            target = {
                ...target,
                boundId: geometryElement.id,
                connection
            };
        }
        const path = PlaitBoard.findPath(board, lineElement);
        resizeArrowLine(board, { source, target }, path);
    }
};
