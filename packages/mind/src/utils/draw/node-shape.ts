import { MindNode } from '../../interfaces/node';
import { getRectangleByNode } from '../position/node';
import { PlaitBoard, RectangleClient, drawRoundRectangle } from '@plait/core';
import { getFillByElement, getStrokeByMindElement, getStrokeWidthByElement } from '../node-style/shape';
import { DefaultNodeStyle } from '../../constants/node-style';
import { MindElement } from '../../interfaces';

export function drawRoundRectangleByNode(board: PlaitBoard, node: MindNode) {
    const rectangle = getRectangleByNode(node);
    return drawRoundRectangleByElement(board, rectangle, node.origin);
}

export function drawRoundRectangleByElement(board: PlaitBoard, nodeRectangle: RectangleClient, element: MindElement) {
    const fill = getFillByElement(board, element);
    const stroke = getStrokeByMindElement(board, element);
    const strokeWidth = getStrokeWidthByElement(board, element);
    const newNodeRectangle = RectangleClient.inflate(nodeRectangle, -strokeWidth);
    const nodeG = drawRoundRectangle(
        PlaitBoard.getRoughSVG(board),
        newNodeRectangle.x,
        newNodeRectangle.y,
        newNodeRectangle.x + newNodeRectangle.width,
        newNodeRectangle.y + newNodeRectangle.height,
        {
            stroke,
            strokeWidth,
            fill,
            fillStyle: 'solid'
        },
        false,
        DefaultNodeStyle.shape.rectangleRadius
    );

    return nodeG;
}
