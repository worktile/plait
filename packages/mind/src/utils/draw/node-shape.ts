import { MindNode } from '../../interfaces/node';
import { getRectangleByNode } from '../position/node';
import { PlaitBoard, Point, RectangleClient, createG, drawRoundRectangle, createPath } from '@plait/core';
import { getStrokeByMindElement } from '../node-style/shape';
import { DefaultNodeStyle, DefaultRootStyle } from '../../constants/node-style';
import { MindElement } from '../../interfaces';
import { Options } from 'roughjs/bin/core';

export function drawRoundRectangleByNode(board: PlaitBoard, node: MindNode) {
    const rectangle = getRectangleByNode(node);
    return drawRoundRectangleByElement(board, rectangle, node.origin);
}

export function drawRoundRectangleByElement(board: PlaitBoard, nodeRectangle: RectangleClient, element: MindElement) {
    const fill = element.fill ? element.fill : element.isRoot ? DefaultRootStyle.fill : DefaultNodeStyle.fill;
    const stroke = getStrokeByMindElement(board, element);
    const strokeWidth = element.strokeWidth ? element.strokeWidth : DefaultNodeStyle.strokeWidth;

    const nodeG = drawRoundRectangle(
        PlaitBoard.getRoughSVG(board),
        nodeRectangle.x,
        nodeRectangle.y,
        nodeRectangle.x + nodeRectangle.width,
        nodeRectangle.y + nodeRectangle.height,
        {
            stroke,
            strokeWidth,
            fill,
            fillStyle: 'solid'
        }
    );

    return nodeG;
}

export function drawLinearPath(points: Point[], options?: Options) {
    const g = createG();
    const path = createPath();

    let polylinePath = '';
    points.forEach((point, index) => {
        if (index === 0) {
            polylinePath += `M ${point[0]} ${point[1]} `;
        } else {
            polylinePath += `L ${point[0]} ${point[1]} `;
        }
    });

    path.setAttribute('d', polylinePath);
    path.setAttribute('stroke', `${options?.stroke}`);
    path.setAttribute('stroke-width', `${options?.strokeWidth}`);
    path.setAttribute('fill', `none`);
    g.appendChild(path);

    return g;
}
