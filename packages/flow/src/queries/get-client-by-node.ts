import { FlowElement } from '../interfaces';

/**
 * getClientByNode
 * @param node FlowElement
 * @returns RectangleClient
 */
export const getClientByNode = (node: FlowElement) => {
    const [x, y] = node.points![0];
    const width = node.width!;
    const height = node.height!;
    return {
        x,
        y,
        width,
        height
    };
};
