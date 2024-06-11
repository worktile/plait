import { PlaitBoard, Point, Transforms, getElementById, idCreator } from '@plait/core';
import { PlaitDrawElement, PlaitGeometry, PlaitLine, PlaitShapeElement } from '../interfaces';
import { PlaitImage } from '../interfaces/image';
import { getConnectionPoint } from './line/line-common';
import { PlaitTable } from '../interfaces/table';
import { updateCellIds, updateRowOrColumnIds } from './table';

export const buildClipboardData = (board: PlaitBoard, elements: PlaitDrawElement[], startPoint: Point) => {
    return elements.map(element => {
        if (PlaitDrawElement.isShapeElement(element)) {
            const points = element.points.map(point => [point[0] - startPoint[0], point[1] - startPoint[1]]);
            return { ...element, points } as PlaitGeometry;
        }
        if (PlaitDrawElement.isLine(element)) {
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
            return { ...element, points, source, target } as PlaitLine;
        }
        return element;
    });
};

export const insertClipboardData = (board: PlaitBoard, elements: PlaitDrawElement[], startPoint: Point) => {
    const lines = elements.filter(value => PlaitDrawElement.isLine(value)) as PlaitLine[];
    const geometries = elements.filter(
        value => (PlaitDrawElement.isGeometry(value) && !PlaitDrawElement.isGeometryByTable(value)) || PlaitDrawElement.isImage(value)
    ) as (PlaitImage | PlaitGeometry)[];
    const tables = elements.filter(value => PlaitDrawElement.isElementByTable(value)) as PlaitTable[];
    geometries.forEach(element => {
        const newId = idCreator();
        updateBoundLinesId(element, lines, newId);
        element.id = newId;
        element.points = element.points.map(point => [startPoint[0] + point[0], startPoint[1] + point[1]]) as [Point, Point];
        Transforms.insertNode(board, element, [board.children.length]);
    });
    insertClipboardTableData(board, tables, startPoint, lines);
    lines.forEach(element => {
        element.id = idCreator();
        element.points = element.points.map(point => [startPoint[0] + point[0], startPoint[1] + point[1]]) as [Point, Point];
        Transforms.insertNode(board, element, [board.children.length]);
    });
    Transforms.addSelectionWithTemporaryElements(board, elements);
};

export const insertClipboardTableData = (board: PlaitBoard, elements: PlaitTable[], startPoint: Point, lines: PlaitLine[]) => {
    elements.forEach(element => {
        const newId = idCreator();
        updateBoundLinesId(element, lines, newId);
        element.id = newId;
        updateRowOrColumnIds(element, 'row');
        updateRowOrColumnIds(element, 'column');
        updateCellIds(element.cells);
        element.points = element.points.map(point => [startPoint[0] + point[0], startPoint[1] + point[1]]) as [Point, Point];
        Transforms.insertNode(board, element, [board.children.length]);
    });
};

export const updateBoundLinesId = (element: PlaitShapeElement, lines: PlaitLine[], newId: string) => {
    const sourceLines: PlaitLine[] = [];
    const targetLines: PlaitLine[] = [];
    lines.forEach(line => {
        if (PlaitLine.isBoundElementOfSource(line, element)) {
            sourceLines.push(line);
        }
        if (PlaitLine.isBoundElementOfTarget(line, element)) {
            targetLines.push(line);
        }
    });
    // update lines
    sourceLines.forEach(sourceLine => (sourceLine.source.boundId = newId));
    targetLines.forEach(targetLine => (targetLine.target.boundId = newId));
};
