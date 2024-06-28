import { PlaitBoard, PlaitNode, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasEdgeElement, ForceAtlasElement, ForceAtlasNodeElement } from '../../interfaces';
import { drawNode } from '../draw';

export class ForceNodeAtlasGenerator extends Generator<ForceAtlasNodeElement> {
    constructor(board: PlaitBoard) {
        super(board);
    }

    canDraw(element: ForceAtlasNodeElement): boolean {
        return true;
    }

    draw(element: ForceAtlasNodeElement) {
        const nodeG = createG();
        const parent = PlaitNode.parent(this.board, PlaitBoard.findPath(this.board, element));
        const activeNodeId = parent?.children?.find(f => ForceAtlasElement.isForceAtlasNodeElement(f) && f.isActive)?.id;
        const edges = parent?.children?.filter(f => ForceAtlasElement.isForceAtlasEdgeElement(f)) as ForceAtlasEdgeElement[];
        const isFirstDepth =
            element?.isActive ||
            edges.some(
                s => (s.source === activeNodeId && s.target === element?.id) || (s.target === activeNodeId && s.source === element?.id)
            );
        nodeG.append(drawNode(this.board, element, element?.points?.[0] || [0, 0], isFirstDepth));
        return nodeG;
    }
}
