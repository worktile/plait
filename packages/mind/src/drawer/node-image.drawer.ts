import { PlaitBoard, RectangleClient, createForeignObject, createG } from '@plait/core';
import { ImageData, MindElement } from '../interfaces';
import { PlaitMindBoard } from '../plugins/with-mind.board';
import { getImageForeignRectangle } from '../utils';
import { ComponentRef, ViewContainerRef } from '@angular/core';
import { MindImageBaseComponent } from '../base/image-base.component';
import { WithMindOptions } from '../interfaces/options';
import { PRIMARY_COLOR, WithMindPluginKey } from '../constants';

export class NodeImageDrawer {
    componentRef: ComponentRef<MindImageBaseComponent> | null = null;

    g?: SVGGElement;

    constructor(private board: PlaitMindBoard, private viewContainerRef: ViewContainerRef) {}

    drawImage(element: MindElement) {
        this.destroy();
        if (MindElement.hasImage(element)) {
            this.g = createG();
            let foreignRectangle = getImageForeignRectangle(this.board, element);
            foreignRectangle = RectangleClient.getOutlineRectangle(foreignRectangle, -6);
            const foreignObject = createForeignObject(
                foreignRectangle.x,
                foreignRectangle.y,
                foreignRectangle.width,
                foreignRectangle.height
            );

            this.g.append(foreignObject);

            if (this.componentRef) {
                this.componentRef.destroy();
                this.componentRef = null;
            }
            const componentType =
                this.board.getPluginOptions<WithMindOptions>(WithMindPluginKey).imageComponentType || MindImageBaseComponent;
            if (!componentType) {
                throw new Error('Not implement drawEmoji method error.');
            }
            this.componentRef = this.viewContainerRef.createComponent(componentType);
            this.componentRef.instance.board = this.board;
            this.componentRef.instance.element = element;
            this.componentRef.instance.imageItem = element.data.image;

            foreignObject.append(this.componentRef.instance.nativeElement);
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
