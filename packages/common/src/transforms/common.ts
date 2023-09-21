import { Path, PlaitBoard, PlaitElement, PlaitPluginElementComponent, Transforms, getSelectedElements } from '@plait/core';

export const setProperty = (board: PlaitBoard, options: any, callback?: (component: PlaitPluginElementComponent, path: Path) => void) => {
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
