import { createForeignObject, createG, updateForeignObject } from '@plait/core';
import { Generator, GeneratorOptions } from '@plait/common';
import { EdgeState, FlowEdge } from '../interfaces/edge';
import { drawEdgeLabelShape } from '../draw/edge';
import { EdgeLabelSpace } from '../utils/edge/label-space';
import { PlaitFlowBoard } from '../interfaces';
import { ComponentRef, ViewContainerRef } from '@angular/core';
import { FlowEdgeLabelIconBaseComponent } from '../core/edge-label-icon-base.component';
import { LabelIconItem } from '../interfaces/icon';
import { TextManage } from '@plait/text';

export interface EdgeData {
    state: EdgeState;
}

export class EdgeLabelGenerator extends Generator<FlowEdge, EdgeData, GeneratorOptions, PlaitFlowBoard> {
    static key = 'edge-label-generator';

    labelIconRef: {
        labelIconG: SVGGElement;
        labelIconComponentRef: ComponentRef<FlowEdgeLabelIconBaseComponent>;
    } | null = null;

    labelTextG: SVGGElement | null = null;

    constructor(board: PlaitFlowBoard, public viewContainerRef: ViewContainerRef, public textManage: TextManage) {
        super(board);
    }

    canDraw(element: FlowEdge, data: EdgeData): boolean {
        if (FlowEdge.hasLabel(element)) {
            return true;
        }
        return false;
    }

    draw(element: FlowEdge, data: EdgeData) {
        const edgeLabelG = createG();
        if (FlowEdge.hasLabel(element)) {
            const textRectangle = EdgeLabelSpace.getLabelTextRectangle(this.board, element);
            const labelRectangle = EdgeLabelSpace.getLabelRect(textRectangle, element);
            const labelShapeG = drawEdgeLabelShape(this.board, element, labelRectangle, data.state);
            edgeLabelG.append(labelShapeG);
            if (this.labelIconRef) {
                this.updateLabelIcon(element);
                edgeLabelG.append(this.labelIconRef.labelIconG);
            } else {
                const labelIconRef = this.drawLabelIcon(element);
                if (labelIconRef) {
                    edgeLabelG.append(labelIconRef.labelIconG);
                    this.labelIconRef = labelIconRef;
                }
            }
            if (this.labelTextG) {
                this.updateLabelText(element);
                edgeLabelG.append(this.labelTextG);
            } else {
                this.labelTextG = this.drawLabelText(element);
                if (this.labelTextG) {
                    edgeLabelG.append(this.labelTextG);
                }
            }
        }
        return edgeLabelG;
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
        return null;
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

    drawLabelText(element: FlowEdge) {
        const text = element.data?.text;
        if (text) {
            this.textManage.draw(text);
            const g = this.textManage.g;
            g.classList.add('flow-edge-richtext');
            return g;
        }
        return null;
    }

    updateLabelText(element: FlowEdge) {
        const text = element.data?.text;
        if (text) {
            this.textManage.updateText(text);
            this.textManage.updateRectangle();
        }
    }
}
