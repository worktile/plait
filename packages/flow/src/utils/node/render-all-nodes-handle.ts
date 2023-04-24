import { FlowElementType } from '../../interfaces/element';
import { FlowNode } from '../../interfaces/node';
import { ELEMENT_TO_PLUGIN_COMPONENT, PlaitBoard, isSelectedElement } from '@plait/core';
import { getFlowElementsByType } from './get-node';
import { FlowNodeComponent } from '../../flow-node.component';

export function drawAllNodesHandle(board: PlaitBoard) {
    const flowNodeElements = getFlowElementsByType(board, FlowElementType.node) as FlowNode[];
    flowNodeElements.map(item => {
        const flowNodeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(item) as FlowNodeComponent;
        flowNodeComponent.drawHandles();
    });
    return flowNodeElements;
}

export function destroyAllNodesHandle(board: PlaitBoard, flowNodeElements: FlowNode[]) {
    flowNodeElements.map(item => {
        const flowNodeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(item) as FlowNodeComponent;
        flowNodeComponent.destroyHandles();
        if (isSelectedElement(board, item)) {
            flowNodeComponent.destroyActiveMask();
        }
    });
}
