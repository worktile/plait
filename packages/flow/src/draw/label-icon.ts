import { ChangeDetectorRef, ComponentRef, NgZone, ViewContainerRef } from '@angular/core';
import { RectangleClient, createForeignObject, createG } from '@plait/core';
import { FlowEdgeLabelIconBaseComponent } from '../base/edge-label-icon-base.component';
import { LabelIconItem } from '../interfaces/icon';
import { PlaitFlowBoard } from '../interfaces';
import { FlowEdge } from '../interfaces/edge';
import { EdgeLabelSpace } from '../utils';

export class FlowEdgeLabelIconDrawer {
    g?: SVGGElement;

    componentRef: ComponentRef<FlowEdgeLabelIconBaseComponent> | null = null;

    constructor(private board: PlaitFlowBoard, private viewContainerRef: ViewContainerRef, private cdr: ChangeDetectorRef) {}

    get nativeElement() {
        if (this.componentRef) {
            return this.componentRef.instance.nativeElement;
        } else {
            return null;
        }
    }

    draw(icon: LabelIconItem, element: FlowEdge) {
        this.destroy();
        const componentType = this.board.drawLabelIcon(icon, element);
        this.componentRef = this.viewContainerRef.createComponent(componentType);
        this.componentRef.instance.iconItem = icon;
        this.componentRef.instance.board = this.board;
        this.componentRef.instance.element = element;
        this.componentRef.instance.fontSize = EdgeLabelSpace.getLabelIconFontSize();
        this.cdr.markForCheck();
    }

    drawLabelIcon(textRect: RectangleClient, element: FlowEdge) {
        this.destroy();
        if (FlowEdge.hasIcon(element)) {
            this.g = createG();
            const foreignRectangle = EdgeLabelSpace.getLabelIconRect(textRect);
            const foreignObject = createForeignObject(
                foreignRectangle.x,
                foreignRectangle.y,
                foreignRectangle.width,
                foreignRectangle.height
            );
            this.g.append(foreignObject);
            const container = document.createElement('div');
            container.classList.add('flow-edge-label-icon');
            foreignObject.append(container);
            this.draw(
                {
                    name: element.data?.icon!
                },
                element
            );
            container.append(this.nativeElement!);
            return this.g;
        }
        return undefined;
    }

    destroy() {
        if (this.g) {
            this.g.remove();
        }
        if (this.componentRef) {
            this.componentRef.destroy();
            this.componentRef = null;
        }
    }
}
