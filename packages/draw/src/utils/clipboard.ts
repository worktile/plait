import { PlaitBoard, Point, Transforms, getElementById, idCreator } from '@plait/core';
import { PlaitArrowLine, PlaitDrawElement, PlaitGeometry, PlaitShapeElement } from '../interfaces';
import { PlaitImage } from '../interfaces/image';
import { getConnectionPoint } from './arrow-line/arrow-line-common';
import { PlaitTable } from '../interfaces/table';
import { updateCellIds, updateRowOrColumnIds } from './table';

export const buildClipboardData = (board: PlaitBoard, elements: PlaitDrawElement[], startPoint: Point) => {
    return elements.map(element => {
        if (PlaitDrawElement.isShapeElement(element)) {
            const points = element.points.map(point => [point[0] - startPoint[0], point[1] - startPoint[1]]);
            return { ...element, points } as PlaitGeometry;
        }
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
        return element;
    });
};

export const insertClipboardData = (board: PlaitBoard, elements: PlaitDrawElement[], startPoint: Point) => {
    const lines = elements.filter(value => PlaitDrawElement.isArrowLine(value)) as PlaitArrowLine[];
    elements.forEach(element => {
        if (PlaitDrawElement.isArrowLine(element)) {
            element.id = idCreator();
            element.points = element.points.map(point => [startPoint[0] + point[0], startPoint[1] + point[1]]) as [Point, Point];
            Transforms.insertNode(board, element, [board.children.length]);
        }
        if ((PlaitDrawElement.isGeometry(element) && !PlaitDrawElement.isGeometryByTable(element)) || PlaitDrawElement.isImage(element)) {
            const newId = idCreator();
            updateBoundArrowLinesId(element, lines, newId);
            element.id = newId;
            element.points = element.points.map(point => [startPoint[0] + point[0], startPoint[1] + point[1]]) as [Point, Point];
            Transforms.insertNode(board, element, [board.children.length]);
        }
        if (PlaitDrawElement.isElementByTable(element)) {
            const newId = idCreator();
            updateBoundArrowLinesId(element as PlaitTable, lines, newId);
            element.id = newId;
            updateRowOrColumnIds(element as PlaitTable, 'row');
            updateRowOrColumnIds(element as PlaitTable, 'column');
            updateCellIds(element.cells);
            element.points = element.points.map(point => [startPoint[0] + point[0], startPoint[1] + point[1]]) as [Point, Point];
        }
    });
    Transforms.addSelectionWithTemporaryElements(board, elements);
};

export const updateBoundArrowLinesId = (element: PlaitShapeElement, lines: PlaitArrowLine[], newId: string) => {
    const sourceLines: PlaitArrowLine[] = [];
    const targetLines: PlaitArrowLine[] = [];
    lines.forEach(line => {
        if (PlaitArrowLine.isBoundElementOfSource(line, element)) {
            sourceLines.push(line);
        }
        if (PlaitArrowLine.isBoundElementOfTarget(line, element)) {
            targetLines.push(line);
        }
    });
    // update lines
    sourceLines.forEach(sourceLine => (sourceLine.source.boundId = newId));
    targetLines.forEach(targetLine => (targetLine.target.boundId = newId));
};
