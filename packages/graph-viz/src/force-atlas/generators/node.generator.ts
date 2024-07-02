import { PlaitBoard, PlaitNode, getSelectedElements } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasElement, ForceAtlasNodeElement } from '../../interfaces';
import { drawNode } from '../draw';
import { isFirstDepthNode } from '../utils/node';

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
        return drawNode(this.board, element, element?.points?.[0] || [0, 0], {
            isFirstDepth: isFirstDepthNode(element.id, activeNodeId, parent as ForceAtlasElement)
        });
    }
}
