import { PlaitBoard, createG } from '@plait/core';
import { Generator, GeneratorOptions } from '@plait/common';
import { EdgeStableState, EdgeState, FlowEdge } from '../interfaces/edge';
import { drawEdgeMarkers, drawEdgeRoute } from '../draw/edge';
import { drawEdgeHandles } from '../draw/handle';

export interface EdgeData {
    state: EdgeState;
}

export class EdgeGenerator extends Generator<FlowEdge, EdgeData, GeneratorOptions, PlaitBoard> {
    static key = 'edge-generator';

    constructor(board: PlaitBoard) {
        super(board, { prepend: true });
    }

    canDraw(element: FlowEdge, data: EdgeData): boolean {
        return true;
    }

    draw(element: FlowEdge, data: EdgeData) {
        const edgeG = createG();
        const edgeRouteG = drawEdgeRoute(this.board, element, data.state);
        const edgeMarksG = drawEdgeMarkers(this.board, element, data.state);
        edgeG.append(edgeRouteG);
        edgeG.append(...edgeMarksG);
        if (data.state === EdgeStableState.active) {
            const handles = drawEdgeHandles(this.board, element);
            handles.forEach(item => {
                item.classList.add('flow-handle');
                item.setAttribute('stroke-linecap', 'round');
            });
            edgeG.append(...handles);
        }
        return edgeG;
    }
}
