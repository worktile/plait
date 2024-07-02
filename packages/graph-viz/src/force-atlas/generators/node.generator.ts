import { PlaitBoard, PlaitNode, createG, getSelectedElements } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasEdgeElement, ForceAtlasElement, ForceAtlasNodeElement } from '../../interfaces';
import { drawNode } from '../draw';

export class ForceAtlasNodeGenerator extends Generator<ForceAtlasNodeElement> {
    static key = 'force-atlas-node';
    constructor(board: PlaitBoard) {
        super(board);
    }

    canDraw(element: ForceAtlasNodeElement): boolean {
        return true;
    }

    draw(element: ForceAtlasNodeElement) {
        const parent = PlaitNode.parent(this.board, PlaitBoard.findPath(this.board, element));
        const selectElements = getSelectedElements(this.board);
        if (selectElements.some(s => s.id === element.id)) {
            return;
        }
        const activeNodeId = selectElements[0]?.id;
        const edges = parent?.children?.filter(f => ForceAtlasElement.isForceAtlasEdgeElement(f)) as ForceAtlasEdgeElement[];
        const isFirstDepth = edges.some(
            s => (s.source === activeNodeId && s.target === element?.id) || (s.target === activeNodeId && s.source === element?.id)
        );
        return drawNode(this.board, element, element?.points?.[0] || [0, 0], { isFirstDepth });
    }
}
