import { createForeignObject, createG } from '@plait/core';
import { ImageItem, MindElement, ImageData } from '../interfaces';
import { PlaitMindBoard } from '../plugins/with-mind.board';
import { getImageForeignRectangle } from '../utils';
import { ComponentRef, ViewContainerRef } from '@angular/core';
import { MindImageBaseComponent } from '../base/image-base.component';
class ImageDrawer {
    componentRef: ComponentRef<MindImageBaseComponent> | null = null;

    constructor(private board: PlaitMindBoard, private viewContainerRef: ViewContainerRef) {}

    draw(image: ImageItem, element: MindElement<ImageData>) {
        this.destroy();
        const componentType = this.board.drawImage(image, element);
        this.componentRef = this.viewContainerRef.createComponent(componentType);
        this.componentRef.instance.board = this.board;
        this.componentRef.instance.element = element;
        this.componentRef.instance.imageItem = image;
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
export class NodeImageDrawer {
    drawer!: ImageDrawer | null;

    g?: SVGGElement;

    constructor(private board: PlaitMindBoard, private viewContainerRef: ViewContainerRef) {}

    drawImage(element: MindElement) {
        this.destroy();
        if (MindElement.hasImage(element)) {
            this.g = createG();
            this.g.classList.add('image');
            const foreignRectangle = getImageForeignRectangle(this.board, element);
            const foreignObject = createForeignObject(
                foreignRectangle.x,
                foreignRectangle.y,
                foreignRectangle.width,
                foreignRectangle.height
            );

            this.g.append(foreignObject);
            this.drawer = new ImageDrawer(this.board, this.viewContainerRef);
            this.drawer.draw(element.data.image, element);
            foreignObject.append(this.drawer.nativeElement!);
            return this.g;
        }
        return undefined;
    }

    destroy() {
        if (this.g) {
            this.g.remove();
        }
        this.drawer?.destroy();
        this.drawer = null;
    }
}
