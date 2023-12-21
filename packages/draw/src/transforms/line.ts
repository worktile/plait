import { Path, PlaitBoard, PlaitElement, PointOfRectangle, Transforms, findElements, getSelectedElements } from '@plait/core';
import {
    FlowchartSymbols,
    GeometryShapes,
    LineHandle,
    LineHandleKey,
    LineMarkerType,
    LineText,
    MemorizeKey,
    PlaitDrawElement,
    PlaitGeometry,
    PlaitLine
} from '../interfaces';
import { getDirectionByVector, getOppositeDirection, memorizeLatest } from '@plait/common';
import { getConnectionPointByGeometryElement, getLinePoints, getPointsByPointAndDirection, transformPointToConnection } from '../utils';
import { DefaultBasicShapeProperty, DefaultFlowchartPropertyMap } from '../constants';
import { insertGeometry } from './geometry';

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

export const collectRefs = (board: PlaitBoard, geometry: PlaitGeometry, refs: { property: Partial<PlaitLine>; path: Path }[]) => {
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

export const setLineAutoComplete = (board: PlaitBoard, element: PlaitLine, shape: GeometryShapes) => {
    const shapeProperty = DefaultFlowchartPropertyMap[shape as FlowchartSymbols] || DefaultBasicShapeProperty;
    const [sourcePoint, targetPoint] = PlaitLine.getPoints(board, element);
    const sourceDirection = getDirectionByVector([targetPoint[0] - sourcePoint[0], targetPoint[1] - sourcePoint[1]]);
    let targetDirection = sourceDirection && getOppositeDirection(sourceDirection);
    if (targetDirection) {
        const geometryPoints = getPointsByPointAndDirection(targetPoint, targetDirection, shapeProperty.width, shapeProperty.height);
        insertGeometry(board, geometryPoints, shape);
        const selectElement = getSelectedElements(board)[0] as PlaitGeometry;
        const connection: PointOfRectangle = getConnectionPointByGeometryElement(board, selectElement, targetPoint);
        const target: LineHandle = {
            ...element.target,
            boundId: selectElement.id,
            connection
        };
        const path = PlaitBoard.findPath(board, element);
        resizeLine(board, { target }, path);
    }
};
