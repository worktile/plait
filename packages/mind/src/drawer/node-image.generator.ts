import { ImageData, MindElement } from '../interfaces';
import { Generator, WithCommonPluginKey } from '@plait/common';
import { getImageForeignRectangle } from '../utils';
import { createForeignObject, createG, updateForeignObject } from '@plait/core';
import { ComponentRef, ViewContainerRef } from '@angular/core';
import { WithCommonPluginOptions } from 'packages/common/src/utils';
import { PlaitMindBoard } from '../plugins/with-mind.board';
import { ImageBaseComponent } from 'packages/common/src/image-base.component';

export interface ShapeData {
    viewContainerRef: ViewContainerRef;
}

export class NodeImageGenerator extends Generator<MindElement, ShapeData, ShapeData> {
    componentRef: ComponentRef<ImageBaseComponent> | null = null;

    foreignObject!: SVGForeignObjectElement;

    canDraw(element: MindElement, data: ShapeData): boolean {
        return true;
    }

    baseDraw(element: MindElement, data?: ShapeData) {
        if (!MindElement.hasImage(element)) {
            this.destroy();
            return;
        }
        const g = createG();
        const foreignRectangle = getImageForeignRectangle(this.board as PlaitMindBoard, element);
        this.foreignObject = createForeignObject(foreignRectangle.x, foreignRectangle.y, foreignRectangle.width, foreignRectangle.height);
        g.append(this.foreignObject);
        const componentType = (this.board as PlaitMindBoard).getPluginOptions<WithCommonPluginOptions>(WithCommonPluginKey)
            .imageComponentType;
        if (!componentType) {
            throw new Error('Not implement ImageBaseComponent error.');
        }
        this.componentRef = this.options!.viewContainerRef.createComponent(componentType);
        this.componentRef!.instance.board = this.board;
        this.componentRef!.instance.imageItem = element.data.image;
        this.componentRef!.instance.element = element;
        this.componentRef!.instance.getRectangle = () => {
            return getImageForeignRectangle(this.board as PlaitMindBoard, element);
        };
        this.componentRef!.instance.hasResizeHandle = () => {
            return true;
        };
        this.componentRef!.instance.cdr.markForCheck();
        this.foreignObject.append(this.componentRef!.instance.nativeElement);
        return g;
    }

    updateImage(nodeG: SVGGElement, previous: MindElement, current: MindElement) {
        if (!MindElement.hasImage(previous) || !MindElement.hasImage(current)) {
            this.draw(current, nodeG);
            return;
        }

        if (previous !== current && this.componentRef) {
            this.componentRef.instance.imageItem = current.data.image;
            this.componentRef!.instance.getRectangle = () => {
                return getImageForeignRectangle(this.board as PlaitMindBoard, (current as unknown) as MindElement<ImageData>);
            };
        }

        const currentForeignObject = getImageForeignRectangle(this.board as PlaitMindBoard, current);
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
}
