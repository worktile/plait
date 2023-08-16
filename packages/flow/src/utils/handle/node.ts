import { PlaitBoard, Point, distanceBetweenPointAndPoint, normalizePoint } from '@plait/core';
import { getDefaultHandles } from './get-default-handles';
import { FlowNode } from '../../interfaces/node';
import { getHandleXYPosition } from './get-handle-position';
import { HANDLE_BUFFER, HANDLE_DIAMETER } from '../../constants/handle';
import { FlowEdgeHandleRef } from '../../interfaces/edge';
import { getFlowElementsByType } from '../node/get-node';
import { FlowElementType } from '../../interfaces/element';
import { getHitNode } from '../node/get-hit-node';

export interface HitNodeHandle extends FlowEdgeHandleRef {
    handlePoint: Point;
}

export function getHitNodeHandle(board: PlaitBoard, point: Point): HitNodeHandle | null {
    let nodeHandle: HitNodeHandle | null = null;
    const hitNode = getHitNode(board, point);
    if (hitNode) {
        nodeHandle = getHitHandleByNode(hitNode, point);
    }
    if (!nodeHandle) {
        const flowNodeElements = getFlowElementsByType(board, FlowElementType.node) as FlowNode[];
        flowNodeElements.map(item => {
            const handles = item.handles || getDefaultHandles();
            handles.filter(handle => {
                const { x, y } = normalizePoint(item.points![0]);
                let { x: handleX, y: handleY } = getHandleXYPosition(
                    handle.position,
                    {
                        x,
                        y,
                        width: item.width,
                        height: item.height
                    },
                    handle
                );
                const distance = distanceBetweenPointAndPoint(handleX, handleY, point[0], point[1]);
                if (distance < HANDLE_DIAMETER / 2 + HANDLE_BUFFER) {
                    nodeHandle = {
                        ...handle,
                        handlePoint: [handleX, handleY],
                        node: item
                    };
                }
            });
        });
    }
    return nodeHandle;
}

export function getHitHandleByNode(node: FlowNode, point: Point): HitNodeHandle | null {
    const handles = node.handles || getDefaultHandles();
    let hitHandle: HitNodeHandle | null = null;
    const { x, y } = normalizePoint(node.points![0]);
    handles.find(handle => {
        const position = getHandleXYPosition(
            handle.position,
            {
                x,
                y,
                width: node.width,
                height: node.height
            },
            handle
        );
        const distance = distanceBetweenPointAndPoint(position.x, position.y, point[0], point[1]);
        if (distance < HANDLE_DIAMETER / 2) {
            hitHandle = {
                ...handle,
                node: node,
                handlePoint: [position.x, position.y]
            };
        }
    });
    return hitHandle;
}
