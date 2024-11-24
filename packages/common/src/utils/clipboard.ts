import { idCreator, PlaitBoard, PlaitElement, Point, Transforms } from '@plait/core';

export const buildClipboardData = (
    board: PlaitBoard,
    elements: PlaitElement[],
    startPoint: Point,
    elementBuilder?: (element: PlaitElement) => PlaitElement | undefined
) => {
    return elements.map(element => {
        const newElement = elementBuilder && elementBuilder(element);
        if (newElement) {
            return newElement;
        }
        if (element.points) {
            const points = element.points.map(point => [point[0] - startPoint[0], point[1] - startPoint[1]]);
            return { ...element, points };
        }
        return element;
    });
};

export const insertClipboardData = (
    board: PlaitBoard,
    elements: PlaitElement[],
    startPoint: Point,
    elementHandler?: (element: PlaitElement, idsMap: Record<string, string>) => void
) => {
    const idsMap: Record<string, string> = {};
    elements.forEach(element => {
        idsMap[element.id] = idCreator();
    });
    elements.forEach(element => {
        element.id = idsMap[element.id];
        elementHandler && elementHandler(element, idsMap);
        if (element.points) {
            element.points = element.points.map(point => [startPoint[0] + point[0], startPoint[1] + point[1]]) as [Point, Point];
        }
        Transforms.insertNode(board, element, [board.children.length]);
    });
    Transforms.addSelectionWithTemporaryElements(board, elements);
};
