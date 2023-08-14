import { RectangleClient, createForeignObject, createG, updateForeignObject } from '@plait/core';
import { ImageData, MindElement } from '../interfaces';
import { PlaitMindBoard } from '../plugins/with-mind.board';
import { getImageForeignRectangle } from '../utils';
import { ComponentRef, ViewContainerRef } from '@angular/core';
import { MindImageBaseComponent } from '../base/image-base.component';
import { WithMindOptions } from '../interfaces/options';
import { WithMindPluginKey } from '../constants';

export class NodeImageDrawer {
    componentRef: ComponentRef<MindImageBaseComponent> | null = null;

    g?: SVGGElement;

    foreignObject!: SVGForeignObjectElement;

    constructor(private board: PlaitMindBoard, private viewContainerRef: ViewContainerRef) {}

    drawImage(nodeG: SVGGElement, element: MindElement) {
        if (!MindElement.hasImage(element)) {
            this.destroy();
            return;
        }

        this.g = createG();
        const foreignRectangle = getImageForeignRectangle(this.board, element);
        this.foreignObject = createForeignObject(foreignRectangle.x, foreignRectangle.y, foreignRectangle.width, foreignRectangle.height);

        this.foreignObject.style.padding = `6px`;

        this.g.append(this.foreignObject);

        const componentType = this.board.getPluginOptions<WithMindOptions>(WithMindPluginKey).imageComponentType;
        if (!componentType) {
            throw new Error('Not implement drawEmoji method error.');
        }
        this.componentRef = this.viewContainerRef.createComponent(componentType);
        this.componentRef.instance.board = this.board;
        this.componentRef.instance.element = element;
        this.componentRef.instance.imageItem = element.data.image;
        this.componentRef.instance.cdr.markForCheck();

        this.foreignObject.append(this.componentRef.instance.nativeElement);
        nodeG.appendChild(this.g);
    }

    updateImage(nodeG: SVGGElement, previous: MindElement, current: MindElement) {
        if (!MindElement.hasImage(previous) || !MindElement.hasImage(current)) {
            this.drawImage(nodeG, current);
            return;
        }

        if (previous !== current && this.componentRef) {
            this.componentRef.instance.element = current;
            this.componentRef.instance.imageItem = current.data.image;
        }

        const currentForeignObject = getImageForeignRectangle(this.board, current);
        updateForeignObject(
            this.g!,
            currentForeignObject.width,
            currentForeignObject.height,
            currentForeignObject.x,
            currentForeignObject.y
        );
        // solve image lose on move node
        if (this.foreignObject.children.length === 0) {
            this.foreignObject.append(this.componentRef!.instance.nativeElement);
        }

        this.componentRef?.instance.cdr.markForCheck();
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
