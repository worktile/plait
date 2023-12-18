import { Path, PlaitBoard, PlaitElement, Transforms, getSelectedElements } from '@plait/core';
import { memorizeLatest } from '../utils';

export interface SetOptions<T extends PlaitElement = PlaitElement> {
    callback?: (element: T, path: Path) => void;
    getMemorizeKey?: (element: T) => string;
    match?: (element: T) => boolean;
}

export const setProperty = <T extends PlaitElement = PlaitElement>(board: PlaitBoard, properties: Partial<T>, options?: SetOptions<T>) => {
    const selectedElements = getSelectedElements(board) as T[];
    selectedElements.forEach(element => {
        if (options?.match && !options?.match(element)) return;
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

const setStrokeStyle = (board: PlaitBoard, strokeStyle: string, options: SetOptions) => {
    setProperty(board, { strokeStyle }, options);
};

const setFillColor = (board: PlaitBoard, fill: string, options: SetOptions) => {
    setProperty(board, { fill }, options);
};

const setStrokeColor = (board: PlaitBoard, strokeColor: string, options: SetOptions) => {
    setProperty(board, { strokeColor }, options);
};

const setStrokeWidth = (board: PlaitBoard, strokeWidth: number, options: SetOptions) => {
    setProperty(board, { strokeWidth }, options);
};

export const PropertyTransforms = {
    setFillColor,
    setStrokeStyle,
    setProperty,
    setStrokeWidth,
    setStrokeColor
};
