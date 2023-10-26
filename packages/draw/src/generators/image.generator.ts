import { Generator, WithCommonPluginKey, ImageBaseComponent } from '@plait/common';
import { PlaitOptionsBoard, RectangleClient, createForeignObject, createG, updateForeignObject } from '@plait/core';
import { PlaitImage } from '../interfaces/image';
import { ComponentRef, ViewContainerRef } from '@angular/core';
import { WithCommonPluginOptions } from 'packages/common/src/utils';

export interface ShapeData {}

export class ImageGenerator extends Generator<PlaitImage, ShapeData> {
    componentRef!: ComponentRef<ImageBaseComponent>;

    canDraw(element: PlaitImage, data: ShapeData): boolean {
        return true;
    }

    baseDraw(element: PlaitImage, viewContainerRef: ViewContainerRef) {
        const g = createG();
        const foreignObject = createForeignObject(element.points[0][0], element.points[0][1], element.width, element.height);
        g.appendChild(foreignObject);
        const componentType = (this.board as PlaitOptionsBoard).getPluginOptions<WithCommonPluginOptions>(WithCommonPluginKey)
            .imageComponentType;
        if (!componentType) {
            throw new Error('Not implement ImageBaseComponent error.');
        }
        this.componentRef = viewContainerRef.createComponent(componentType);
        this.componentRef.instance.board = this.board;
        const commonImageItem = {
            url: element.url,
            width: element.points[1][0] - element.points[0][0],
            height: element.points[1][1] - element.points[0][1]
        };
        this.componentRef.instance.imageItem = commonImageItem;
        this.componentRef.instance.element = element;
        this.componentRef.instance.getRectangle = () => {
            return RectangleClient.toRectangleClient(element.points);
        };
        this.componentRef.instance.cdr.markForCheck();
        foreignObject.append(this.componentRef!.instance.nativeElement);
        return g;
    }

    updateImage(nodeG: SVGGElement, previous: PlaitImage, current: PlaitImage) {
        if (previous !== current && this.componentRef) {
            const commonImageItem = {
                url: current.url,
                width: current.points[1][0] - current.points[0][0],
                height: current.points[1][1] - current.points[0][1]
            };
            this.componentRef.instance.imageItem = commonImageItem;
            this.componentRef!.instance.getRectangle = () => {
                return RectangleClient.toRectangleClient(current.points);
            };
        }

        const currentForeignObject = RectangleClient.toRectangleClient(current.points)
        updateForeignObject(
            this.g!,
            currentForeignObject.width,
            currentForeignObject.height,
            currentForeignObject.x,
            currentForeignObject.y
        );

        this.componentRef?.instance.cdr.markForCheck();
    }
}
