import { PlaitBoard, PlaitElement, isSelectedElement } from '@plait/core';
import { NodeState } from '../../interfaces/node';
import { PlaitCommonElementRef, getFirstTextManage } from '@plait/common';
import { NodeActiveGenerator } from '../../generators/node-active.generator';
import { NodeGenerator } from '../../generators/node.generator';
import { getFlowNodeById } from '../node/get-node';

export const renderNode = (board: PlaitBoard, nodeId: string, state?: NodeState) => {
    const node = getFlowNodeById(board, nodeId);
    const selected = isSelectedElement(board, node);
    const elementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(node);
    const textManage = getFirstTextManage(node);
    const handleGenerator = elementRef.getGenerator<NodeActiveGenerator>(NodeActiveGenerator.key);
    const nodeGenerator = elementRef.getGenerator<NodeGenerator>(NodeGenerator.key);
    if (!selected) {
        if (state === NodeState.hovering) {
            nodeGenerator && nodeGenerator.processDrawing(node, PlaitBoard.getElementActiveHost(board));
            PlaitBoard.getElementActiveHost(board).append(textManage.g);
            handleGenerator.processDrawing(node, PlaitBoard.getElementActiveHost(board), { selected, hovered: true });
        } else {
            handleGenerator.destroy();
            nodeGenerator && nodeGenerator.processDrawing(node, PlaitElement.getElementG(node));
            PlaitElement.getElementG(node).append(textManage.g);
        }
    }
};
