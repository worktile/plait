import { PlaitBoard } from '@plait/core';
import { Generator } from '@plait/common';
import { FlowNode } from '../interfaces/node';
import { drawNode } from '../draw/node';

export class NodeGenerator extends Generator<FlowNode> {
    constructor(board: PlaitBoard) {
        super(board);
    }

    canDraw(element: FlowNode): boolean {
        return true;
    }

    draw(element: FlowNode) {
        return drawNode(this.board, element);
    }
}
