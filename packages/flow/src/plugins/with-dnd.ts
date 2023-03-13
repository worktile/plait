import {
    ELEMENT_TO_PLUGIN_COMPONENT,
    IS_TEXT_EDITABLE,
    Path,
    PlaitBoard,
    PlaitPlugin,
    Point,
    Transforms,
    toPoint,
    transformPoint
} from '@plait/core';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowElement, isFlowNodeElement } from '../interfaces';
import { getEdgesByNode } from '../queries/get-edges-by-node';
import { FlowEdgeComponent } from '../flow-edge.component';
import { isHitFlowNode } from '../queries/is-hit-flow-element';

export const withFloweDnd: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup, keydown } = board;

    let activeComponent: FlowNodeComponent | null;
    let activeElement: FlowElement | null;
    let startPoint: Point | null;
    let isDragging = false;
    let offsetX: number = 0;
    let offsetY: number = 0;

    board.mousedown = (event: MouseEvent) => {
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board) || event.button === 2) {
            mousedown(event);
            return;
        }
        const point = transformPoint(board, toPoint(event.x, event.y, board.host));
        (board.children as FlowElement[]).forEach(value => {
            if (isFlowNodeElement(value)) {
                const flowNodeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(value) as FlowNodeComponent;
                const hitFlowElement = isHitFlowNode(flowNodeComponent.element, point);
                if (hitFlowElement) {
                    activeComponent = flowNodeComponent;
                    activeElement = value;
                    startPoint = point;
                }
            }
        });
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        if (!board.options.readonly && startPoint) {
            const endPoint = transformPoint(board, toPoint(event.x, event.y, board.host));
            if (!isDragging) {
                isDragging = true;
            } else {
                offsetX = endPoint[0] - startPoint[0];
                offsetY = endPoint[1] - startPoint[1];
                if (activeElement && isFlowNodeElement(activeElement)) {
                    activeComponent?.render2.setStyle(activeComponent.g, 'transform', `translate(${offsetX}px, ${offsetY}px)`);
                    const edges = getEdgesByNode(board, activeElement!);
                    if (edges.length) {
                        edges.map(item => {
                            const edgeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(item) as FlowEdgeComponent;
                            edgeComponent!.updateFlowEdge(true);
                        });
                    }
                }
            }
        }
        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (!board.options.readonly && activeElement) {
            const path = board.children.findIndex(item => item.id === activeElement?.id);
            if (isFlowNodeElement(activeElement) && activeElement?.points) {
                const [x, y] = activeElement?.points[0] as Path;
                Transforms.setNode(board, { ...activeElement, points: [[x + offsetX, y + offsetY]] }, [path]);
                activeComponent?.render2.setStyle(activeComponent.g, 'transform', null);
            }
            isDragging = false;
            activeComponent = null;
            activeElement = null;
            startPoint = null;
            offsetX = 0;
            offsetY = 0;
        }
        globalMouseup(event);
    };
    return board;
};
