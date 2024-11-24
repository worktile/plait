import { PlaitBoard, PlaitElement, Point, Transforms, getElementById, idCreator } from '@plait/core';
import { buildClipboardData as basicBuildClipboard, insertClipboardData as basicInsertClipboard } from '@plait/common';
import { PlaitArrowLine, PlaitDrawElement, PlaitGeometry } from '../interfaces';
import { getConnectionPoint } from './arrow-line/arrow-line-common';
import { PlaitTable } from '../interfaces/table';
import { updateCellIds, updateRowOrColumnIds } from './table';

export const buildClipboardData = (board: PlaitBoard, elements: PlaitDrawElement[], startPoint: Point) => {
    return basicBuildClipboard(board, elements, startPoint, (element: PlaitElement) => {
        if (PlaitDrawElement.isArrowLine(element)) {
            let source = { ...element.source };
            let target = { ...element.target };
            let points = [...element.points];
            if (element.source.boundId) {
                points[0] = getConnectionPoint(getElementById<PlaitGeometry>(board, element.source.boundId)!, element.source.connection!);
                if (!getElementById(board, element.source.boundId, elements)) {
                    delete source.boundId;
                    delete source.connection;
                }
            }
            if (element.target.boundId) {
                points[points.length - 1] = getConnectionPoint(
                    getElementById<PlaitGeometry>(board, element.target.boundId)!,
                    element.target.connection!
                );
                if (!getElementById(board, element.target.boundId, elements)) {
                    delete target.boundId;
                    delete target.connection;
                }
            }
            points = points.map(point => [point[0] - startPoint[0], point[1] - startPoint[1]]);
            return { ...element, points, source, target } as PlaitArrowLine;
        }
        return undefined;
    });
};

export const insertClipboardData = (board: PlaitBoard, elements: PlaitDrawElement[], startPoint: Point) => {
    basicInsertClipboard(board, elements, startPoint, (element: PlaitElement, idsMap: Record<string, string>) => {
        if (PlaitDrawElement.isArrowLine(element)) {
            if (element.source.boundId) {
                const boundElement = elements.find(item => [element.source.boundId, idsMap[element.source.boundId!]].includes(item.id));
                if (boundElement) {
                    element.source.boundId = idsMap[element.source.boundId];
                }
            }
            if (element.target.boundId) {
                const boundElement = elements.find(item => [element.target.boundId, idsMap[element.target.boundId!]].includes(item.id));
                if (boundElement) {
                    element.target.boundId = idsMap[element.target.boundId];
                }
            }
        }
        if (PlaitDrawElement.isElementByTable(element)) {
            updateRowOrColumnIds(element as PlaitTable, 'row');
            updateRowOrColumnIds(element as PlaitTable, 'column');
            updateCellIds(element.cells);
        }
    });
};
