import { RectangleClient, Point, transformPoint, toPoint, PlaitBoard } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { Options } from 'roughjs/bin/core';
import { WorkflowElement } from '../interfaces';
import { WORKFLOW_ELEMENT_TO_COMPONENT } from '../plugins/weak-maps';
import { WorkflowBaseComponent } from '../workflow-base.component';
import { WorkflowQueries } from '../queries';
import { WORKFLOW_NODE_PORT_RADIOUS } from '../constants';

export function getRectangleByNode(node: WorkflowElement): RectangleClient {
    const [x, y] = node.points[0];
    const width = node.width!;
    const height = node.height!;
    const nodeComponent = WORKFLOW_ELEMENT_TO_COMPONENT.get(node) as WorkflowBaseComponent;
    if (nodeComponent?.workflowGGroup?.style?.transform) {
        const { transform } = nodeComponent.workflowGGroup?.style;
        const [offsetX, offsetY] = transform
            .split('(')[1]
            .split(')')[0]
            .split(',')
            .map(parseFloat);
        return {
            x: x + offsetX,
            y: y + offsetY,
            width,
            height
        };
    }
    return {
        x,
        y,
        width,
        height
    };
}

export function drawRoundRectangle(rs: RoughSVG, x1: number, y1: number, x2: number, y2: number, options: Options, outline = false) {
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);

    const defaultRadius = Math.min(width, height) / 8;
    let radius = defaultRadius;
    if (defaultRadius > 16) {
        radius = outline ? 16 + 2 : 16;
    }

    const point1 = [x1 + radius, y1];
    const point2 = [x2 - radius, y1];
    const point3 = [x2, y1 + radius];
    const point4 = [x2, y2 - radius];
    const point5 = [x2 - radius, y2];
    const point6 = [x1 + radius, y2];
    const point7 = [x1, y2 - radius];
    const point8 = [x1, y1 + radius];
    return rs.path(
        `M${point2[0]} ${point2[1]} A ${radius} ${radius}, 0, 0, 1, ${point3[0]} ${point3[1]} L ${point4[0]} ${point4[1]} A ${radius} ${radius}, 0, 0, 1, ${point5[0]} ${point5[1]} L ${point6[0]} ${point6[1]} A ${radius} ${radius}, 0, 0, 1, ${point7[0]} ${point7[1]} L ${point8[0]} ${point8[1]} A ${radius} ${radius}, 0, 0, 1, ${point1[0]} ${point1[1]} Z`,
        options
    );
}

export const getNodePorts: (node: WorkflowElement) => Point[] = (node: WorkflowElement) => {
    /**
     *  ---- 0 ----- 1 ----- 2 ----
     * ｜                          ｜
     * 7                           3
     * ｜                          ｜
     *  ---- 6 ----- 5 ----- 4 ----
     */
    const { x, y, width, height } = getRectangleByNode(node);
    const port0 = [x + width / 4, y];
    const port1 = [x + width / 2, y];
    const port2 = [x + (width / 4) * 3, y];
    const port3 = [x + width, y + height / 2];
    const port4 = [x + (width / 4) * 3, y + height];
    const port5 = [x + width / 2, y + height];
    const port6 = [x + width / 4, y + height];
    const port7 = [x, y + height / 2];
    return [port0, port1, port2, port3, port4, port5, port6, port7] as Point[];
};

export function hitWorkflowNode(point: Point, node: WorkflowElement) {
    const { x, y, width, height } = getRectangleByNode(node);
    return point[0] >= x && point[0] <= x + width && point[1] >= y && point[1] <= y + height;
}

export function hitWorkflowPortNode(board: PlaitBoard, point: Point, node: WorkflowElement) {
    const pointWithStartAndEnd = WorkflowQueries.getPointByTransition(board, node);

    const { startPoint, endPoint } = pointWithStartAndEnd;
    let startDistance;
    if (pointWithStartAndEnd.type === 'directed') {
        startDistance = Math.pow(startPoint![0] - point[0], 2) + Math.pow(startPoint![1] - point[1], 2);
        if (startDistance < Math.pow(WORKFLOW_NODE_PORT_RADIOUS, 2)) {
            pointWithStartAndEnd.startPoint = point;
            return 'start';
        }
    }

    const endDistance = Math.pow(endPoint![0] - point[0], 2) + Math.pow(endPoint![1] - point[1], 2);
    if (endDistance < Math.pow(WORKFLOW_NODE_PORT_RADIOUS, 2)) {
        pointWithStartAndEnd.endPoint = point;
        return 'end';
    }
    return null;
}

export function isInCircle(circleCentre: Point, point: Point) {
    const distance = Math.pow(circleCentre![0] - point[0], 2) + Math.pow(circleCentre![1] - point[1], 2);
    return distance < Math.pow(WORKFLOW_NODE_PORT_RADIOUS, 2);
}

export function hitWorkflowTranstion(event: MouseEvent, node: WorkflowElement) {
    const nodeComponent = WORKFLOW_ELEMENT_TO_COMPONENT.get(node) as WorkflowBaseComponent;
    const { x, y, width, height } = nodeComponent.workflowGGroup.getBoundingClientRect();
    return event.x >= x && event.x <= x + width && event.y >= y && event.y <= y + height;
}
