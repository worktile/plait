import { ComponentRef, ViewContainerRef } from '@angular/core';
import { createForeignObject, createG } from '@plait/core';
import { FlowEdgeLabelIconBaseComponent } from '../base/edge-label-icon-base.component';
import { IconItem } from '../interfaces/icon';
import { PlaitFlowBoard } from '../interfaces';
import { getIconFontSize, getIconForeignRectangle } from '../utils/icon/icon';
import { FlowEdge } from '../interfaces/edge';

class IconDrawer {
    componentRef: ComponentRef<FlowEdgeLabelIconBaseComponent> | null = null;

    constructor(private board: PlaitFlowBoard, private viewContainerRef: ViewContainerRef) {}

    draw(icon: IconItem, element: FlowEdge) {
        this.destroy();
        const componentType = this.board.drawIcon(icon, element);
        this.componentRef = this.viewContainerRef.createComponent(componentType);
        this.componentRef.instance.iconItem = icon;
        this.componentRef.instance.board = this.board;
        this.componentRef.instance.element = element;
        this.componentRef.instance.fontSize = getIconFontSize();
    }

    get nativeElement() {
        if (this.componentRef) {
            return this.componentRef.instance.nativeElement;
        } else {
            return null;
        }
    }

    destroy() {
        if (this.componentRef) {
            this.componentRef.destroy();
            this.componentRef = null;
        }
    }
}

export class FlowEdgeLabelIconDrawer {
    iconDrawer!: IconDrawer | null;

    g?: SVGGElement;

    constructor(private board: PlaitFlowBoard, private viewContainerRef: ViewContainerRef) {}

    drawIcon(element: FlowEdge) {
        this.destroy();
        if (FlowEdge.hasIcon(element)) {
            this.g = createG();
            this.g.classList.add('flow-icon');
            const foreignRectangle = getIconForeignRectangle(element);
            const foreignObject = createForeignObject(
                foreignRectangle.x,
                foreignRectangle.y,
                foreignRectangle.width,
                foreignRectangle.height
            );
            this.g.append(foreignObject);
            const container = document.createElement('div');
            container.classList.add('node-emojis-container');
            foreignObject.append(container);
            const drawer = new IconDrawer(this.board, this.viewContainerRef);
            drawer.draw(
                {
                    name: element.data?.icon!
                },
                element
            );
            this.iconDrawer = drawer;
            container.append(this.iconDrawer.nativeElement!);
            return this.g;
        }
        return undefined;
    }

    destroy() {
        if (this.g) {
            this.g.remove();
        }
        if (this.iconDrawer) {
            this.iconDrawer.destroy();
        }
        this.iconDrawer = null;
    }
}
