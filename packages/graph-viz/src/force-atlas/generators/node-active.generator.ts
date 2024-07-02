import { PlaitBoard, PlaitNode, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasEdgeElement, ForceAtlasElement, ForceAtlasNodeElement } from '../../interfaces';
import { drawActiveNode } from '../draw';

export class ForceActiveNodeAtlasGenerator extends Generator<ForceAtlasNodeElement> {
    constructor(board: PlaitBoard) {
        super(board);
    }

    canDraw(element: ForceAtlasNodeElement): boolean {
        return true;
    }

    draw(element: ForceAtlasNodeElement) {
        console.log('draw active node', element.label);
        return drawActiveNode(this.board, element, element?.points?.[0] || [0, 0], true);
    }
}
