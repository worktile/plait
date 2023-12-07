import { Path, PlaitBoard, PlaitElement, Transforms, getSelectedElements } from '@plait/core';

export const setProperty = <T extends PlaitElement = PlaitElement>(
    board: PlaitBoard,
    options: Partial<T>,
    callback?: (element: T, path: Path) => void
) => {
    const selectedElements = getSelectedElements(board) as T[];
    selectedElements.forEach(element => {
        const path = PlaitBoard.findPath(board, element);
        if (callback) {
            callback(element, path);
        } else {
            Transforms.setNode(board, options, path);
        }
    });
};

const setStrokeStyle = (board: PlaitBoard, strokeStyle: string) => {
    setProperty(board, { strokeStyle });
};

const setFillColor = (board: PlaitBoard, fill: string) => {
    setProperty(board, { fill });
};

const setStrokeColor = (board: PlaitBoard, strokeColor: string) => {
    setProperty(board, { strokeColor });
};

const setStrokeWidth = (board: PlaitBoard, strokeWidth: number) => {
    setProperty(board, { strokeWidth });
};

export const PropertyTransforms = {
    setFillColor,
    setStrokeStyle,
    setProperty,
    setStrokeWidth,
    setStrokeColor
};
