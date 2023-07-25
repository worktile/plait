import { createForeignObject, createG, updateForeignObject } from '@plait/core';
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

    constructor(private board: PlaitMindBoard, private viewContainerRef: ViewContainerRef) {}

    drawImage(element: MindElement) {
        if (MindElement.hasImage(element)) {
            this.g = createG();
            const foreignRectangle = getImageForeignRectangle(this.board, element);
            const foreignObject = createForeignObject(
                foreignRectangle.x,
                foreignRectangle.y,
                foreignRectangle.width,
                foreignRectangle.height
            );

            this.g.append(foreignObject);

            const componentType =
                this.board.getPluginOptions<WithMindOptions>(WithMindPluginKey).imageComponentType || MindImageBaseComponent;
            if (!componentType) {
                throw new Error('Not implement drawEmoji method error.');
            }
            this.componentRef = this.viewContainerRef.createComponent(componentType);
            this.componentRef.instance.board = this.board;
            this.componentRef.instance.element = element;
            this.componentRef.instance.imageItem = element.data.image;
            this.componentRef.instance.cdr.markForCheck();

            foreignObject.append(this.componentRef.instance.nativeElement);
            return this.g;
        }
        return undefined;
    }

    updateImage(previous: MindElement, current: MindElement) {
        if (!MindElement.hasImage(current)) {
            this.destroy();
            return;
        }

        if (previous !== current && this.componentRef) {
            this.componentRef.instance.element = current;
            this.componentRef.instance.imageItem = current.data.image;
        }

        const previousForeignObject = getImageForeignRectangle(this.board, previous as MindElement<ImageData>);
        const currentForeignObject = getImageForeignRectangle(this.board, current);
        if (currentForeignObject !== previousForeignObject) {
            updateForeignObject(
                this.g!,
                currentForeignObject.width,
                currentForeignObject.height,
                currentForeignObject.x,
                currentForeignObject.y
            );
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
