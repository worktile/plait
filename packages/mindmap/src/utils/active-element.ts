import { PlaitBoard } from '@plait/core';
import { HAS_SELECTED_MINDMAP, HAS_SELECTED_MINDMAP_ELEMENT, MINDMAP_ELEMENT_TO_COMPONENT, SELECTED_MINDMAP_NODES } from './weak-maps';

export function clearSelectedElements(board: PlaitBoard) {
    // 清除选中状态
    const selectedElements = SELECTED_MINDMAP_NODES.get(board);
    selectedElements?.forEach(ele => {
        const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(ele);
        if (nodeComponent) {
            HAS_SELECTED_MINDMAP_ELEMENT.has(nodeComponent.node.origin) && HAS_SELECTED_MINDMAP_ELEMENT.delete(nodeComponent.node.origin);
        }
    });
    SELECTED_MINDMAP_NODES.delete(board);
    HAS_SELECTED_MINDMAP.has(board) && HAS_SELECTED_MINDMAP.delete(board);
}
