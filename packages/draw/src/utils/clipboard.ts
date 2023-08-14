import { PlaitBoard, Point, Transforms, idCreator } from '@plait/core';
import { PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';

export const buildClipboardData = (board: PlaitBoard, elements: PlaitDrawElement[], startPoint: Point) => {
    return elements.map(element => {
        if (PlaitDrawElement.isGeometry(element)) {
            const points = element.points.map(point => [point[0] - startPoint[0], point[1] - startPoint[1]]);
            return { ...element, points } as PlaitGeometry;
        }
        if (PlaitDrawElement.isLine(element)) {
            const points = element.points.map(point => [point[0] - startPoint[0], point[1] - startPoint[1]]);
            return { ...element, points } as PlaitLine;
        }
        return element;
    });
};

export const insertClipboardData = (board: PlaitBoard, elements: PlaitDrawElement[], startPoint: Point) => {
    elements.forEach(element => {
        element.id = idCreator();
        element.points = element.points.map(point => [startPoint[0] + point[0], startPoint[1] + point[1]]);
        Transforms.insertNode(board, element, [board.children.length]);
    });
};
