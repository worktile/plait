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
import { hitWorkflowNode, hitWorkflowTranstion } from '../utils/graph';
import { WorkflowBaseComponent } from '../workflow-base.component';
import { WORKFLOW_ELEMENT_TO_COMPONENT } from './weak-maps';
import { WorkflowQueries } from '../queries/index';
import { WorkflowTransitionComponent } from '../transition.component';

export const withNodeDnd: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mousemove, globalMouseup, keydown } = board;

    let activeComponent: WorkflowBaseComponent | undefined;
    let activeElement: WorkflowElement | null;
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
        (board.children as WorkflowElement[]).forEach(value => {
            if (activeComponent) {
                return;
            }
            if (isWorkflowNode(value) && hitWorkflowNode(point, value)) {
                activeComponent = WORKFLOW_ELEMENT_TO_COMPONENT.get(value);
                startPoint = point;
                activeElement = value;
            }

            if (isWorkflowTransition(value) && hitWorkflowTranstion(event, value)) {
                activeComponent = WORKFLOW_ELEMENT_TO_COMPONENT.get(value);
                activeElement = value;
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
                // 拖拽节点
                if (activeElement) {
                    offsetX = endPoint[0] - startPoint[0];
                    offsetY = endPoint[1] - startPoint[1];
                    activeComponent?.render2.setStyle(activeComponent.workflowGGroup, 'transform', `translate(${offsetX}px, ${offsetY}px)`);
                    const transtions = WorkflowQueries.getTranstionsByNode(board, activeElement!);
                    if (!transtions.length) {
                        return;
                    }
                    transtions.map(item => {
                        const transtionComponent = WORKFLOW_ELEMENT_TO_COMPONENT.get(item) as WorkflowTransitionComponent;
                        transtionComponent.redrawElement();
                    });
                }
            }
        }
        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (!board.options.readonly && activeElement && activeElement?.points.length) {
            const [x, y] = activeElement?.points[0] as Path;
            const path = board.children.findIndex(item => item.id === activeElement?.id);
            Transforms.setNode(board, { ...activeElement, points: [[x + offsetX, y + offsetY]] }, [path]);
            activeComponent?.render2.setStyle(activeComponent.workflowGGroup, 'transform', null);
            isDragging = false;
            activeComponent = undefined;
            activeElement = null;
            startPoint = null;
        }
        globalMouseup(event);
    };

    return board;
};
