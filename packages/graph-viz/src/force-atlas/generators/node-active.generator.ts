import { PlaitBoard } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasNodeElement } from '../../interfaces';
import { drawActiveNode } from '../utils/draw';

export class ForceActiveNodeAtlasGenerator extends Generator<ForceAtlasNodeElement> {
    constructor(board: PlaitBoard) {
        super(board);
    }

    canDraw(element: ForceAtlasNodeElement): boolean {
        return true;
    }

    draw(element: ForceAtlasNodeElement) {
        return drawActiveNode(this.board, element, element?.points?.[0] || [0, 0], true);
    }
}
