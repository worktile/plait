import { RoughSVG } from 'roughjs/bin/svg';
import { WORKFLOW_GLOBAL_LINK_LENGTH } from '../constants';
import { WorkflowElement, WorkflowPortsNode, WorkflowTransitionType } from '../interfaces';
import { computedProbablyPoints } from '../utils/points';
import { PlaitBoard } from '@plait/core';
import AStar from '../utils/AStar';
import { Options } from 'roughjs/bin/core';
import { Position, getBend, getPoints } from '../utils/path';
import { getRectangleByNode } from '../utils';

const aStar = new AStar();

export const drawLineByTransitionType = (
    board: PlaitBoard,
    roughSVG: RoughSVG,
    node: WorkflowPortsNode,
    type: WorkflowTransitionType,
    options: Options = {}
) => {
    let linkG;
    switch (type) {
        case 'inital':
            linkG = drawInitalLine(roughSVG, node, options);
            break;
        case 'global':
            linkG = drawGlobalLine(roughSVG, node, options);
            break;
        default:
            linkG = drawDirectedLine(board, roughSVG, node, options);
            break;
    }
    return linkG;
};

export const drawInitalLine = (roughSVG: RoughSVG, node: WorkflowPortsNode, options: Options = {}) => {
    const { startPoint, endPoint } = node;
    if (startPoint && endPoint) {
        return roughSVG.line(startPoint.point[0], startPoint.point[1], endPoint.point[0], endPoint.point[1], {
            fillStyle: 'solid',
            stroke: '#999',
            strokeWidth: 2,
            ...options
        });
    }
    return null;
};

export const drawGlobalLine = (roughSVG: RoughSVG, node: WorkflowPortsNode, options: Options = {}) => {
    const { endPoint } = node;
    return roughSVG.line(endPoint!.point[0], endPoint!.point[1] + 5, endPoint!.point[0], endPoint!.point[1] + WORKFLOW_GLOBAL_LINK_LENGTH, {
        fillStyle: 'solid',
        stroke: '#999',
        strokeWidth: 2,
        ...options
    });
};

export const drawDirectedLine = (board: PlaitBoard, roughSVG: RoughSVG, node: WorkflowElement, options: Options = {}) => {
    // const startNode = board.children.find(item => item.id === node.from!.id) as WorkflowElement;
    // const endNode = board.children.find(item => item.id === node.to!.id) as WorkflowElement;
    console.log(node, 'node');
    const { position: sourcePosition, point: sourcePoint } = node.startPoint;
    const { position: targetPosition, point: targetPoint } = node.endPoint;
    // console.log(rect1.x, rect2.x, node.startPoint, node.endPoint);

    const [pathPoints, labelX, labelY, offsetX, offsetY] = getPoints({
        source: { x: sourcePosition[0], y: sourcePosition[1] },
        sourcePosition: sourcePoint,
        target: { x: targetPosition[0], y: targetPoint[1] },
        targetPosition,
        center: { x: undefined, y: undefined },
        offset: 20
    });
    // const data = pathPoints.map(item => {
    //     return [item.x, item.y];
    // });
    const path = pathPoints.reduce<string>((res, p, i) => {
        let segment = '';

        if (i > 0 && i < pathPoints.length - 1) {
            segment = getBend(pathPoints[i - 1], p, pathPoints[i + 1], 5);
        } else {
            segment = `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`;
        }

        res += segment;

        return res;
    }, '');
    // return [path, labelX, labelY, offsetX, offsetY];
    console.log(123, path, node.startPoint);

    // let { fakeStartPoint, fakeEndPoint, points } = computedProbablyPoints(node.startPoint!, node.endPoint!, startNode, endNode, false);
    // const routes = aStar.start(fakeStartPoint!, fakeEndPoint!, points);

    // return roughSVG.linearPath([node.startPoint!, ...data, node.endPoint], {
    //     fillStyle: 'solid',
    //     stroke: '#999',
    //     strokeWidth: 2,
    //     ...options
    // });
    return roughSVG.path(path, {
        fillStyle: 'solid',
        stroke: '#999',
        strokeWidth: 2,
        ...options
    });
};
