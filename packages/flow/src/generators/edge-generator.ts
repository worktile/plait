import { PlaitBoard, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { FlowEdge } from '../interfaces/edge';
import { drawEdgeLabelShape, drawEdgeMarkers, drawEdgeRoute } from '../draw/edge';
import { FlowRenderMode } from '../interfaces/flow';
import { EdgeLabelSpace } from '../utils/edge/label-space';

export interface EdgeActiveData {
    selected: boolean;
    hovered: boolean;
}

export class EdgeGenerator extends Generator<FlowEdge, EdgeActiveData> {
    static key = 'edge-generator';

    constructor(board: PlaitBoard) {
        super(board, { prepend: true });
    }

    canDraw(element: FlowEdge, data: EdgeActiveData): boolean {
        return true;
    }

    draw(element: FlowEdge, data: EdgeActiveData) {
        const mode = data.selected ? FlowRenderMode.active : data.hovered ? FlowRenderMode.hover : FlowRenderMode.default;
        const edgeG = createG();
        const edgeRouteG = drawEdgeRoute(this.board, element, mode);
        const edgeMarksG = drawEdgeMarkers(this.board, element, mode);
        const textRectangle = EdgeLabelSpace.getLabelTextRect(this.board, element);
        const labelRectangle = EdgeLabelSpace.getLabelRect(textRectangle, element);
        const labelShapeG = drawEdgeLabelShape(this.board, element, labelRectangle, mode);
        edgeG.append(edgeRouteG);
        edgeG.append(...edgeMarksG);
        edgeG.append(labelShapeG)
        return edgeG;
    }
}
