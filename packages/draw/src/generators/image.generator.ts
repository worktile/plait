import { getRectangleByPoints, Generator, WithCommonPluginKey } from '@plait/common';
import { PlaitOptionsBoard, createForeignObject, createG } from '@plait/core';
import { PlaitImage } from '../interfaces/image';
import { ViewContainerRef } from '@angular/core';
import { WithCommonPluginOptions } from 'packages/common/src/utils';

export interface ShapeData {}

export class ImageGenerator extends Generator<PlaitImage, ShapeData> {
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
            throw new Error('Not implement drawEmoji method error.');
        }
        const componentRef = viewContainerRef.createComponent(componentType);
        componentRef.instance.board = this.board;
        componentRef.instance.imageItem = element;
        componentRef.instance.cdr.markForCheck();

        foreignObject.append(componentRef.instance.nativeElement);
        return g;
    }
}
