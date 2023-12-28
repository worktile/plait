import { MERGING, PlaitBoard, Point, RectangleClient, Transforms, getRectangleByElements, getSelectedElements } from '@plait/core';

export const alignTop = (board: PlaitBoard) => {
    function getOffset(outerRectangle: RectangleClient, rectangle: RectangleClient) {
        return [0, outerRectangle.y - rectangle.y] as Point;
    }
    setOffset(board, getOffset);
};

export const alignHorizontalCenter = (board: PlaitBoard) => {
    function getOffset(outerRectangle: RectangleClient, rectangle: RectangleClient) {
        const outerCenter = outerRectangle.y + outerRectangle.height / 2;
        const elementCenter = rectangle.y + rectangle.height / 2;
        return [0, outerCenter - elementCenter] as Point;
    }
    setOffset(board, getOffset);
};

export const alignBottom = (board: PlaitBoard) => {
    function getOffset(outerRectangle: RectangleClient, rectangle: RectangleClient) {
        return [0, outerRectangle.y + outerRectangle.height - (rectangle.y + rectangle.height)] as Point;
    }
    setOffset(board, getOffset);
};

export const alignLeft = (board: PlaitBoard) => {
    function getOffset(outerRectangle: RectangleClient, rectangle: RectangleClient) {
        return [outerRectangle.x - rectangle.x, 0] as Point;
    }
    setOffset(board, getOffset);
};

export const alignVerticalCenter = (board: PlaitBoard) => {
    function getOffset(outerRectangle: RectangleClient, rectangle: RectangleClient) {
        const outerCenter = outerRectangle.x + outerRectangle.width / 2;
        const elementCenter = rectangle.x + rectangle.width / 2;
        return [outerCenter - elementCenter, 0] as Point;
    }
    setOffset(board, getOffset);
};

export const alignRight = (board: PlaitBoard) => {
    function getOffset(outerRectangle: RectangleClient, rectangle: RectangleClient) {
        return [outerRectangle.x + outerRectangle.width - (rectangle.x + rectangle.width), 0] as Point;
    }
    setOffset(board, getOffset);
};

function setOffset(board: PlaitBoard, getOffset: (outerRectangle: RectangleClient, rectangle: RectangleClient) => Point) {
    let elements = getSelectedElements(board);
    elements = elements.filter(element => board.children.includes(element));
    const outerRectangle = getRectangleByElements(board, elements, false);
    elements.forEach(element => {
        if (!element.points) return;
        const path = PlaitBoard.findPath(board, element);
        const rectangle = board.getRectangle(element)!;
        const offset = getOffset(outerRectangle, rectangle);
        const newPoints = element.points.map(p => [p[0] + offset[0], p[1] + offset[1]]) as Point[];
        Transforms.setNode(
            board,
            {
                points: newPoints
            },
            path
        );
        MERGING.set(board, true);
    });
    MERGING.set(board, false);
}

export interface AlignTransform {
    alignTop: (board: PlaitBoard) => void;
    alignHorizontalCenter: (board: PlaitBoard) => void;
    alignBottom: (board: PlaitBoard) => void;
    alignLeft: (board: PlaitBoard) => void;
    alignVerticalCenter: (board: PlaitBoard) => void;
    alignRight: (board: PlaitBoard) => void;
}

export const AlignTransform: AlignTransform = {
    alignTop,
    alignHorizontalCenter,
    alignBottom,
    alignLeft,
    alignVerticalCenter,
    alignRight
};
