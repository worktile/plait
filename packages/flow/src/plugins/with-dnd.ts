import {
    BOARD_TO_HOST,
    ELEMENT_TO_PLUGIN_COMPONENT,
    IS_TEXT_EDITABLE,
    Path,
    PlaitBoard,
    PlaitPlugin,
    Point,
    RectangleClient,
    Transforms,
    distanceBetweenPointAndPoint,
    isSelectedElement,
    normalizePoint,
    toPoint,
    transformPoint
} from '@plait/core';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowEdgeComponent } from '../flow-edge.component';
import { FlowElement } from '../interfaces/element';
import { FlowEdge, FlowEdgeHandleType } from '../interfaces/edge';
import { isHitFlowEdge } from '../utils/edge/is-hit-edge-element';
import { getHandleSource } from '../utils/handle/get-handle-source';
import { FlowNode } from '../interfaces/node';
import { Element } from 'slate';
import { getDefaultHandles } from '../utils/handle/get-default-handles';
import { getHandleXYPosition } from '../utils/handle/get-handle-position';
import { HANDLE_RADIUS } from '../constants/handle';

export const withFlowDnd: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup, keydown } = board;

    let isDragging = false;
    let activeElement: FlowNode | FlowEdge<Element> | null;
    let activeComponent: FlowNodeComponent | FlowEdgeComponent | null;
    let startPoint: Point | null;
    let handleSource: FlowEdgeHandleType | null;
    let offsetX: number = 0;
    let offsetY: number = 0;
    let flowNodeElements: FlowNode[] = [];
    let path: Path = [];

    board.mousedown = (event: MouseEvent) => {
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board) || event.button === 2) {
            mousedown(event);
            return;
        }
        const host = BOARD_TO_HOST.get(board);
        const point = transformPoint(board, toPoint(event.x, event.y, host!));
        (board.children as FlowElement[]).forEach((value, index) => {
            if (FlowEdge.isFlowEdgeElement<Element>(value) && board.selection) {
                const flowEdgeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(value) as FlowEdgeComponent;
                const clickRect = RectangleClient.toRectangleClient([board.selection.anchor, board.selection.focus]);
                const hitFlowEdge = isHitFlowEdge(board, value, [clickRect.x, clickRect.y]);
                if (hitFlowEdge) {
                    activeComponent = flowEdgeComponent;
                    activeElement = value as FlowEdge<Element>;
                    startPoint = point;
                    handleSource = getHandleSource(point, board, value);
                    path = [index];
                }
            }
        });
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        if (!board.options.readonly && startPoint) {
            const host = BOARD_TO_HOST.get(board);
            const endPoint = transformPoint(board, toPoint(event.x, event.y, host!));
            if (!isDragging) {
                isDragging = true;
            } else {
                offsetX = endPoint[0] - startPoint[0];
                offsetY = endPoint[1] - startPoint[1];
                if (activeElement && FlowEdge.isFlowEdgeElement(activeElement) && handleSource) {
                    (activeComponent as FlowEdgeComponent).drawDraggingElement(activeElement, true, offsetX, offsetY, handleSource);
                    // 所有的 node 节点显示 handle
                    flowNodeElements = board.children.filter(item => FlowNode.isFlowNodeElement(item)) as FlowNode[];
                    flowNodeElements.map(item => {
                        const flowNodeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(item) as FlowNodeComponent;
                        flowNodeComponent.drawHandles();
                    });
                }
            }
        }
        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (!board.options.readonly && activeElement && FlowEdge.isFlowEdgeElement(activeElement) && handleSource) {
            const [currentX, currentY] = board.selection?.focus!;
            flowNodeElements.map(item => {
                const handles = item.handles || getDefaultHandles();
                handles.map(handle => {
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
                    const distance = distanceBetweenPointAndPoint(handleX, handleY, currentX, currentY);
                    if (distance < HANDLE_RADIUS && handleSource && activeElement) {
                        Transforms.setNode(
                            board,
                            {
                                [handleSource]: { ...activeElement[handleSource], id: item.id, ...handle }
                            },
                            path
                        );
                    }
                });
                const flowNodeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(item) as FlowNodeComponent;
                flowNodeComponent.destroyHandles();
                if (isSelectedElement(board, item)) {
                    flowNodeComponent.destroyActiveMask();
                }
            });
            isDragging = false;
            activeElement = null;
            activeComponent = null;
            startPoint = null;
            handleSource = null;
            offsetX = 0;
            offsetY = 0;
            flowNodeElements = [];
            path = [];
        }
        globalMouseup(event);
    };
    return board;
};
