import { FlowElementType } from '../../interfaces/element';
import { FlowNode } from '../../interfaces/node';
import { PlaitBoard, PlaitElement, isSelectedElement } from '@plait/core';
import { getFlowElementsByType } from './get-node';
import { FlowNodeComponent } from '../../flow-node.component';
import { FlowRenderMode } from '../../interfaces/flow';

export function drawAllNodesHandle(board: PlaitBoard) {
    const flowNodeElements = getFlowElementsByType(board, FlowElementType.node) as FlowNode[];
    flowNodeElements.map(item => {
        const flowNodeComponent = PlaitElement.getComponent(item) as FlowNodeComponent;
        flowNodeComponent.drawHandles(item, FlowRenderMode.active);
        PlaitBoard.getElementActiveHost(board).append(flowNodeComponent.handlesG!);
    });
    return flowNodeElements;
}

export function destroyAllNodesHandle(board: PlaitBoard, flowNodeElements: FlowNode[]) {
    flowNodeElements.map(item => {
        const flowNodeComponent = PlaitElement.getComponent(item) as FlowNodeComponent;
        !flowNodeComponent.selected && flowNodeComponent.destroyHandles();
        if (isSelectedElement(board, item)) {
            !flowNodeComponent.selected && flowNodeComponent.destroyActiveMask();
        }
    });
}
