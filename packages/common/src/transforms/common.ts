import { Path, PlaitBoard, PlaitElement, PlaitPluginElementComponent, Transforms, getSelectedElements } from '@plait/core';

const setNode = (board: PlaitBoard, options: any, callback?: (component: PlaitPluginElementComponent, path: Path) => void) => {
    const selectedElements = getSelectedElements(board);
    selectedElements.forEach(element => {
        const path = PlaitBoard.findPath(board, element);
        if (callback) {
            const component = PlaitElement.getComponent(element);
            callback(component, path);
        } else {
            Transforms.setNode(board, options, path);
        }
    });
};

const setBranchWidth = (board: PlaitBoard, strokeWidth: number) => {
    setNode(board, { strokeWidth });
};

const setBranchColor = (board: PlaitBoard, strokeColor: string) => {
    setNode(board, { strokeColor });
};

const setStrokeStyle = (board: PlaitBoard, strokeStyle: string) => {
    setNode(board, { strokeStyle });
};

const setFillColor = (board: PlaitBoard, fill: string) => {
    setNode(board, { fill });
};

export const CommonTransforms = {
    setBranchWidth,
    setBranchColor,
    setFillColor,
    setStrokeStyle,
    setNode
};
