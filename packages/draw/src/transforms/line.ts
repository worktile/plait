import { Path, PlaitBoard, PlaitElement, PointOfRectangle, Transforms, findElements } from '@plait/core';
import {
    LineHandle,
    LineHandleKey,
    LineMarkerType,
    LineText,
    MemorizeKey,
    PlaitDrawElement,
    PlaitGeometry,
    PlaitLine
} from '../interfaces';
import { memorizeLatest } from '@plait/common';
import { getLinePoints, transformPointToConnection } from '../utils';

export const resizeLine = (board: PlaitBoard, options: Partial<PlaitLine>, path: Path) => {
    Transforms.setNode(board, options, path);
};

export const setLineTexts = (board: PlaitBoard, element: PlaitLine, texts: LineText[]) => {
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, { texts }, path);
};

export const removeLineText = (board: PlaitBoard, element: PlaitLine, index: number) => {
    const path = PlaitBoard.findPath(board, element);
    const texts = element.texts?.length ? [...element.texts] : [];
    const newTexts = [...texts];
    newTexts.splice(index, 1);
    Transforms.setNode(board, { texts: newTexts }, path);
};

export const setLineMark = (board: PlaitBoard, element: PlaitLine, handleKey: LineHandleKey, marker: LineMarkerType) => {
    const path = PlaitBoard.findPath(board, element);
    let handle = handleKey === LineHandleKey.source ? element.source : element.target;
    handle = { ...handle, marker };
    memorizeLatest(MemorizeKey.line, handleKey, marker);
    Transforms.setNode(board, { [handleKey]: handle }, path);
};

export const collectLineUpdatedRefsByGeometry = (
    board: PlaitBoard,
    geometry: PlaitGeometry,
    refs: { property: Partial<PlaitLine>; path: Path }[]
) => {
    const lines = findElements(board, {
        match: (element: PlaitElement) => {
            if (PlaitDrawElement.isLine(element)) {
                return element.source.boundId === geometry.id || element.target.boundId === geometry.id;
            }
            return false;
        },
        recursion: element => true
    }) as PlaitLine[];
    if (lines.length) {
        lines.forEach(line => {
            const isSourceBound = line.source.boundId === geometry.id;
            const handle = isSourceBound ? 'source' : 'target';
            const object = { ...line[handle] };
            const linePoints = getLinePoints(board, line);
            const point = isSourceBound ? linePoints[0] : linePoints[linePoints.length - 1];
            object.connection = transformPointToConnection(board, point, geometry);
            const path = PlaitBoard.findPath(board, line);
            const index = refs.findIndex(obj => Path.equals(obj.path, path));
            if (index === -1) {
                refs.push({
                    property: {
                        [handle]: object
                    },
                    path
                });
            } else {
                refs[index].property = { ...refs[index].property, [handle]: object };
            }
        });
    }
};

export const connectLineToGeometry = (board: PlaitBoard, lineElement: PlaitLine, handle: LineHandleKey, geometryElement: PlaitGeometry) => {
    const linePoints = PlaitLine.getPoints(board, lineElement);
    const point = handle === LineHandleKey.source ? linePoints[0] : linePoints[linePoints.length - 1];
    const connection: PointOfRectangle = transformPointToConnection(
        board,
        point,
        geometryElement,
        Math.max(geometryElement.width, geometryElement.height)
    );
    if (connection) {
        let source: LineHandle = lineElement.source;
        let target: LineHandle = lineElement.target;
        if (handle === LineHandleKey.source) {
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
        resizeLine(board, { source, target }, path);
    }
};
