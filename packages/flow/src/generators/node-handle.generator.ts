import { PlaitBoard, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { FlowNode } from '../interfaces/node';
import { drawNodeHandles } from '../draw/handle';

export interface NodeHandleData {
    hovered: boolean;
    selected: boolean;
}

export class NodeHandleGenerator extends Generator<FlowNode, NodeHandleData> {
    static key = 'node-handle-generator';

    constructor(board: PlaitBoard) {
        super(board);
    }

    canDraw(element: FlowNode, data: NodeHandleData): boolean {
        return data.hovered || data.selected;
    }

    draw(element: FlowNode, data: NodeHandleData) {
        const handlesG = createG();
        const handles = drawNodeHandles(this.board, element);
        handles.forEach(item => {
            handlesG.append(item);
            item.classList.add('flow-handle');
        });
        handlesG.setAttribute('stroke-linecap', 'round');
        return handlesG;
    }
}
