import {
    createG,
    distanceBetweenPointAndPoint,
    HOST_TO_ROUGH_SVG,
    IS_TEXT_EDITABLE,
    Path,
    PlaitBoard,
    PlaitElement,
    PlaitPlugin,
    Point,
    toPoint,
    transformPoint,
    Transforms,
    BaseCursorStatus,
    updateCursorStatus
} from '@plait/core';
import { isWorkflowNode, isWorkflowTransition, WorkflowElement } from '../interfaces';
import { getNodePorts, hitWorkflowNode, hitWorkflowPortNode, hitWorkflowTranstion, isInCircle } from '../utils/graph';
import { WorkflowBaseComponent } from '../workflow-base.component';
import { WORKFLOW_ELEMENT_TO_COMPONENT } from './weak-maps';
import { WorkflowQueries } from '../queries/index';
import { WorkflowTransitionComponent } from '../transition.component';
import { WorkflowNodeComponent } from '../node.component';

export const withNodeDnd: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup, keydown } = board;

    let activeComponent: WorkflowBaseComponent | undefined;
    let activeElement: WorkflowElement | null;
    let startPoint: Point | null;
    let changePort: 'start' | 'end' | null;
    let isDragging = false;
    let offsetX: number = 0;
    let offsetY: number = 0;

    board.mousedown = (event: MouseEvent) => {
        if (board.options.readonly || IS_TEXT_EDITABLE.get(board) || event.button === 2) {
            mousedown(event);
            return;
        }
        const point = transformPoint(board, toPoint(event.x, event.y, board.host));
        (board.children as WorkflowElement[]).forEach(value => {
            if (isWorkflowNode(value) && hitWorkflowNode(point, value)) {
                activeComponent = WORKFLOW_ELEMENT_TO_COMPONENT.get(value);
                startPoint = point;
                activeElement = value;
            } else if (isWorkflowTransition(value) && hitWorkflowTranstion(event, value)) {
                activeComponent = WORKFLOW_ELEMENT_TO_COMPONENT.get(value);
                activeElement = value;
                changePort = hitWorkflowPortNode(board, point, value);
                startPoint = changePort ? point : null;
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
                // 拖拽节点
                if (activeElement && isWorkflowNode(activeElement)) {
                    activeComponent?.render2.setStyle(activeComponent.workflowGGroup, 'transform', `translate(${offsetX}px, ${offsetY}px)`);
                    const transtions = WorkflowQueries.getTranstionsByNode(board, activeElement!);
                    if (!transtions.length) {
                        return;
                    }
                    transtions.map(item => {
                        const transtionComponent = WORKFLOW_ELEMENT_TO_COMPONENT.get(item) as WorkflowTransitionComponent;
                        transtionComponent.updateWorkflow();
                        if (item.type !== 'global') {
                            transtionComponent.drawActiveG(0, 0, null, { stroke: '#333' });
                        }
                    });
                }
                // 拖拽连线
                if (activeElement && isWorkflowTransition(activeElement)) {
                    (activeComponent as WorkflowTransitionComponent).drawActiveG(offsetX, offsetY, changePort);
                    (board.children as WorkflowElement[]).forEach(value => {
                        if (isWorkflowNode(value)) {
                            const componet = WORKFLOW_ELEMENT_TO_COMPONENT.get(value) as WorkflowNodeComponent;
                            componet.drawLinkPorts();
                            componet.setPortDisplay(true);
                        }
                    });
                }
            }
        }
        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (!board.options.readonly && activeElement) {
            const path = board.children.findIndex(item => item.id === activeElement?.id);
            if (isWorkflowNode(activeElement) && activeElement?.points.length) {
                const [x, y] = activeElement?.points[0] as Path;
                Transforms.setNode(board, { ...activeElement, points: [[x + offsetX, y + offsetY]] }, [path]);
            }
            if (isWorkflowTransition(activeElement) && changePort) {
                const point = WorkflowQueries.getPointByTransition(board, activeElement);
                let currentPoint: Point;
                if (point) {
                    if (changePort === 'start') {
                        // 判断当前点位是否是接口的点位
                        currentPoint = [point.startPoint!.point[0] + offsetX, point.startPoint!.point[1] + offsetY] as Point;
                    }
                    if (changePort === 'end') {
                        // 判断当前点位是否是接口的点位
                        currentPoint = [point.endPoint!.point[0] + offsetX, point.endPoint!.point[1] + offsetY] as Point;
                    }
                    if (currentPoint!) {
                        (board.children as WorkflowElement[]).forEach(value => {
                            if (isWorkflowNode(value)) {
                                const componet = WORKFLOW_ELEMENT_TO_COMPONENT.get(value) as WorkflowNodeComponent;
                                componet.setPortDisplay(false);

                                const ports = getNodePorts(value);
                                const index = ports.findIndex(item => isInCircle(item.point, currentPoint));
                                if (index > -1) {
                                    if (changePort === 'start') {
                                        Transforms.setNode(board, { ...activeElement, from: { id: value.id, port: index } }, [path]);
                                    } else {
                                        Transforms.setNode(board, { ...activeElement, to: { id: value.id, port: index } }, [path]);
                                    }
                                }
                            }
                        });
                    }
                }
            }
            activeComponent?.render2.setStyle(activeComponent.workflowGGroup, 'transform', null);
            isDragging = false;
            activeComponent = undefined;
            activeElement = null;
            startPoint = null;
            offsetX = 0;
            offsetY = 0;
        }
        globalMouseup(event);
    };

    return board;
};
