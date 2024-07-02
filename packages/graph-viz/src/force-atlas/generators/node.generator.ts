import { PlaitBoard } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasNodeElement } from '../../interfaces';
import { drawNode } from '../utils/draw';
import { NodeGeneratorData } from '../types';

export class ForceAtlasNodeGenerator extends Generator<ForceAtlasNodeElement, NodeGeneratorData> {
    static key = 'force-atlas-node';
    constructor(board: PlaitBoard) {
        super(board);
    }

    canDraw(element: ForceAtlasNodeElement): boolean {
        return true;
    }

    draw(element: ForceAtlasNodeElement, data: NodeGeneratorData) {
        return drawNode(this.board, element, element?.points?.[0] || [0, 0], data);
    }
}
