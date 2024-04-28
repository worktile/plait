import { PlaitBoard, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { FlowNode } from '../interfaces/node';
import { drawNodeActiveMask } from '../draw/node';
import { drawNodeHandles } from '../draw/handle';

export interface NodeActiveData {
    selected: boolean;
    hovered: boolean;
}

export class NodeActiveGenerator extends Generator<FlowNode, NodeActiveData> {
    static key = 'node-active-generator';

    constructor(board: PlaitBoard) {
        super(board);
    }

    canDraw(element: FlowNode, data: NodeActiveData): boolean {
        return data.selected || data.hovered;
    }

    draw(element: FlowNode, data: NodeActiveData) {
        const activeG = createG();
        const hasHandle = data.hovered || data.selected;
        const hasActiveMask = data.selected;
        if (hasActiveMask) {
            const activeMaskG = drawNodeActiveMask(this.board, element);
            activeG.append(activeMaskG);
        }
        if (hasHandle) {
            const handlesG = createG();
            const handles = drawNodeHandles(this.board, element);
            handles.forEach(item => {
                handlesG.append(item);
                item.classList.add('flow-handle');
            });
            handlesG.setAttribute('stroke-linecap', 'round');
            activeG.append(handlesG);
        }
        return activeG;
    }
}
