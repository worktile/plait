import { FlowElementType } from '../../interfaces/element';
import { FlowNode } from '../../interfaces/node';
import { PlaitBoard, PlaitElement, isSelectedElement } from '@plait/core';
import { getFlowElementsByType } from './get-node';
import { PlaitCommonElementRef } from '@plait/common';
import { NodeActiveGenerator } from '../../generators/node-active.generator';

export function drawAllNodesHandle(board: PlaitBoard) {
    const flowNodeElements = getFlowElementsByType(board, FlowElementType.node) as FlowNode[];
    flowNodeElements.map(item => {
        const elementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(item);
        const activeGenerator = elementRef.getGenerator<NodeActiveGenerator>(NodeActiveGenerator.key);
        const selected = isSelectedElement(board, item);
        activeGenerator.processDrawing(item, PlaitBoard.getElementActiveHost(board), { hovered: true, selected });
    });
    return flowNodeElements;
}

export function destroyAllNodesHandle(board: PlaitBoard, flowNodeElements: FlowNode[]) {
    flowNodeElements.map(item => {
        const elementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(item);
        const selected = isSelectedElement(board, item);
        const handleGenerator = elementRef.getGenerator<NodeActiveGenerator>(NodeActiveGenerator.key);
        if (!selected) {
            handleGenerator.destroy();
        }
    });
}
