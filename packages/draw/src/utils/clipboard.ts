import { PlaitBoard, Point, Transforms, getElementById, idCreator } from '@plait/core';
import { PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';

export const buildClipboardData = (board: PlaitBoard, elements: PlaitDrawElement[], startPoint: Point) => {
    return elements.map(element => {
        if (PlaitDrawElement.isGeometry(element)) {
            const points = element.points.map(point => [point[0] - startPoint[0], point[1] - startPoint[1]]);
            return { ...element, points } as PlaitGeometry;
        }
        if (PlaitDrawElement.isLine(element)) {
            let source = { ...element.source };
            let target = { ...element.target };
            if (element.source.boundId && !getElementById(board, element.source.boundId, elements)) {
                delete source.boundId;
                delete source.connection;
            }
            if (element.target.boundId && !getElementById(board, element.target.boundId, elements)) {
                delete target.boundId;
                delete target.connection;
            }
            const points = element.points.map(point => [point[0] - startPoint[0], point[1] - startPoint[1]]);
            return { ...element, points, source, target } as PlaitLine;
        }
        return element;
    });
};

export const insertClipboardData = (board: PlaitBoard, elements: PlaitDrawElement[], startPoint: Point) => {
    const lines = elements.filter(value => PlaitDrawElement.isLine(value)) as PlaitLine[];
    const geometries = elements.filter(value => PlaitDrawElement.isGeometry(value)) as PlaitGeometry[];
    geometries.forEach(element => {
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
        element.id = idCreator();

        // update lines
        sourceLines.forEach(sourceLine => (sourceLine.source.boundId = element.id));
        targetLines.forEach(targetLine => (targetLine.target.boundId = element.id));

        element.points = element.points.map(point => [startPoint[0] + point[0], startPoint[1] + point[1]]) as [Point, Point];
        Transforms.insertNode(board, element, [board.children.length]);
    });
    lines.forEach(element => {
        element.id = idCreator();
        element.points = element.points.map(point => [startPoint[0] + point[0], startPoint[1] + point[1]]) as [Point, Point];
        Transforms.insertNode(board, element, [board.children.length]);
    });
    Transforms.addSelectionWithTemporaryElements(board, elements);
};
