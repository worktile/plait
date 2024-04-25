import { createForeignObject, createG, updateForeignObject } from '@plait/core';
import { Generator, GeneratorOptions } from '@plait/common';
import { FlowEdge } from '../interfaces/edge';
import { drawEdgeLabelShape, drawEdgeMarkers, drawEdgeRoute } from '../draw/edge';
import { FlowRenderMode } from '../interfaces/flow';
import { EdgeLabelSpace } from '../utils/edge/label-space';
import { PlaitFlowBoard } from '../interfaces';
import { ComponentRef, ViewContainerRef } from '@angular/core';
import { FlowEdgeLabelIconBaseComponent } from '../core/edge-label-icon-base.component';
import { LabelIconItem } from '../interfaces/icon';

export interface EdgeActiveData {
    selected: boolean;
    hovered: boolean;
}

export class EdgeGenerator extends Generator<FlowEdge, EdgeActiveData, GeneratorOptions, PlaitFlowBoard> {
    static key = 'edge-generator';

    labelIconRef: {
        labelIconG: SVGGElement;
        labelIconComponentRef: ComponentRef<FlowEdgeLabelIconBaseComponent>;
    } | null = null;

    constructor(board: PlaitFlowBoard, public viewContainerRef: ViewContainerRef) {
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
        edgeG.append(edgeRouteG);
        edgeG.append(...edgeMarksG);
        if (FlowEdge.hasLabel(element)) {
            const textRectangle = EdgeLabelSpace.getLabelTextRectangle(this.board, element);
            const labelRectangle = EdgeLabelSpace.getLabelRect(textRectangle, element);
            const labelShapeG = drawEdgeLabelShape(this.board, element, labelRectangle, mode);
            edgeG.append(labelShapeG);
            if (this.labelIconRef) {
                this.updateLabelIcon(element);
                edgeG.append(this.labelIconRef.labelIconG);
            } else {
                const labelIconRef = this.drawLabelIcon(element);
                if (labelIconRef) {
                    edgeG.append(labelIconRef.labelIconG);
                    this.labelIconRef = labelIconRef;
                }
            }
        }
        return edgeG;
    }

    drawLabelIcon(element: FlowEdge) {
        if (FlowEdge.hasLabelIcon(element)) {
            const labelIconG = createG();
            const textRectangle = EdgeLabelSpace.getLabelTextRectangle(this.board, element);
            const labelIconRectangle = EdgeLabelSpace.getLabelIconRectangle(textRectangle);
            const foreignObject = createForeignObject(
                labelIconRectangle.x,
                labelIconRectangle.y,
                labelIconRectangle.width,
                labelIconRectangle.height
            );
            labelIconG.append(foreignObject);
            const container = document.createElement('div');
            container.classList.add('flow-edge-label-icon');
            foreignObject.append(container);
            const labelIconItem: LabelIconItem = { name: element.data!.icon! };
            const componentType = this.board.drawLabelIcon(labelIconItem, element);
            const labelIconComponentRef = this.viewContainerRef.createComponent(componentType);
            labelIconComponentRef.instance.iconItem = labelIconItem;
            labelIconComponentRef.instance.board = this.board;
            labelIconComponentRef.instance.element = element;
            labelIconComponentRef.instance.fontSize = EdgeLabelSpace.getLabelIconFontSize();
            labelIconComponentRef.changeDetectorRef.detectChanges();
            container.append(labelIconComponentRef.instance.nativeElement);
            return {
                labelIconG,
                labelIconComponentRef
            };
        }
        return undefined;
    }

    updateLabelIcon(element: FlowEdge) {
        if (FlowEdge.hasLabelIcon(element) && this.labelIconRef) {
            const textRectangle = EdgeLabelSpace.getLabelTextRectangle(this.board, element);
            const labelIconRectangle = EdgeLabelSpace.getLabelIconRectangle(textRectangle);
            updateForeignObject(
                this.labelIconRef.labelIconG,
                labelIconRectangle.width,
                labelIconRectangle.height,
                labelIconRectangle.x,
                labelIconRectangle.y
            );
        }
    }
}
