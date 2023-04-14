import { FlowElementType } from '../../interfaces/element';
import { FlowNode } from '../../interfaces/node';
import { ELEMENT_TO_PLUGIN_COMPONENT, PlaitBoard } from '@plait/core';
import { getFlowElementsByType } from '../get-node-by-id';
import { FlowNodeComponent } from '../../flow-node.component';

export function renderAllNodesHandle(board: PlaitBoard) {
    const flowNodeElements = getFlowElementsByType(board, FlowElementType.node) as FlowNode[];
    flowNodeElements.map(item => {
        const flowNodeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(item) as FlowNodeComponent;
        flowNodeComponent.drawHandles();
    });
    return flowNodeElements;
}
