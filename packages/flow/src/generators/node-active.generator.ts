import { PlaitBoard } from '@plait/core';
import { Generator } from '@plait/common';
import { FlowNode } from '../interfaces/node';
import { drawNodeActiveMask } from '../draw/node';

export interface NodeHandleData {
    selected: boolean;
}

export class NodeActiveGenerator extends Generator<FlowNode, NodeHandleData> {
    constructor(board: PlaitBoard) {
        super(board);
    }

    canDraw(element: FlowNode, data: NodeHandleData): boolean {
        return data.selected;
    }

    draw(element: FlowNode, data: NodeHandleData) {
        return drawNodeActiveMask(this.board, element);
    }
}
