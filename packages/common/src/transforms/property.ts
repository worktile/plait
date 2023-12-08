import { Path, PlaitBoard, PlaitElement, Transforms, getSelectedElements } from '@plait/core';
import { memorizeLatest } from '../utils';

export const setProperty = <T extends PlaitElement = PlaitElement>(
    board: PlaitBoard,
    properties: Partial<T>,
    options?: {
        callback?: (element: T, path: Path) => void;
        getMemorizeKey?: (element: T) => string;
    }
) => {
    const selectedElements = getSelectedElements(board) as T[];
    selectedElements.forEach(element => {
        const path = PlaitBoard.findPath(board, element);
        const memorizeKey = options?.getMemorizeKey ? options?.getMemorizeKey(element) : '';
        for (let key in properties) {
            memorizeKey && memorizeLatest(memorizeKey, key, properties[key]);
        }
        if (options?.callback) {
            options.callback(element, path);
        } else {
            Transforms.setNode(board, properties, path);
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
