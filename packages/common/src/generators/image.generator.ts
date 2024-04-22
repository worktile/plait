import {
    PlaitBoard,
    PlaitElement,
    PlaitOptionsBoard,
    RectangleClient,
    createForeignObject,
    createG,
    setAngleForG,
    updateForeignObject
} from '@plait/core';
import { Generator, GeneratorOptions } from './generator';
import { ComponentRef, ViewContainerRef } from '@angular/core';
import { ImageBaseComponent } from '../core/image-base.component';
import { CommonImageItem, WithCommonPluginOptions } from '../utils';
import { WithCommonPluginKey } from '../constants';
export interface ShapeData {
    viewContainerRef: ViewContainerRef;
}

export interface ImageGeneratorOptions<T> {
    getRectangle: (element: T) => RectangleClient;
    getImageItem: (element: T) => CommonImageItem;
}

export class ImageGenerator<T extends PlaitElement = PlaitElement> extends Generator<
    T,
    ViewContainerRef,
    ImageGeneratorOptions<T> & GeneratorOptions
> {
    static key = 'image-generator';

    foreignObject!: SVGForeignObjectElement;

    componentRef!: ComponentRef<ImageBaseComponent>;

    constructor(public board: PlaitBoard, public options: ImageGeneratorOptions<T>) {
        super(board, options);
    }

    canDraw(element: T, data: ViewContainerRef): boolean {
        return !!this.options.getImageItem(element);
    }

    draw(element: T, viewContainerRef: ViewContainerRef): SVGGElement {
        const g = createG();
        const foreignRectangle = this.options.getRectangle(element);
        this.foreignObject = createForeignObject(foreignRectangle.x, foreignRectangle.y, foreignRectangle.width, foreignRectangle.height);
        g.append(this.foreignObject);
        const componentType = (this.board as PlaitOptionsBoard).getPluginOptions<WithCommonPluginOptions>(WithCommonPluginKey)
            .imageComponentType;
        if (!componentType) {
            throw new Error('Not implement ImageBaseComponent error.');
        }
        this.componentRef = viewContainerRef.createComponent(componentType);
        this.componentRef.instance.board = this.board;

        this.componentRef.instance.imageItem = this.options.getImageItem(element);
        this.componentRef.instance.element = element;
        this.componentRef.instance.getRectangle = () => {
            return this.options.getRectangle(element);
        };
        this.componentRef.instance.cdr.markForCheck();
        this.foreignObject.append(this.componentRef!.instance.nativeElement);
        return g;
    }

    updateImage(nodeG: SVGGElement, previous: T, current: T) {
        if (previous !== current && this.componentRef) {
            this.componentRef.instance.imageItem = this.options.getImageItem(current);
            this.componentRef.instance.element = current;
            this.componentRef!.instance.getRectangle = () => {
                return this.options.getRectangle(current);
            };
        }
        const currentForeignObject = this.options.getRectangle(current);
        updateForeignObject(
            this.g!,
            currentForeignObject.width,
            currentForeignObject.height,
            currentForeignObject.x,
            currentForeignObject.y
        );
        if (currentForeignObject && current.angle) {
            setAngleForG(this.g!, RectangleClient.getCenterPoint(currentForeignObject), current.angle);
        }
        // solve image lose on move node
        if (this.foreignObject.children.length === 0) {
            this.foreignObject.append(this.componentRef!.instance.nativeElement);
        }
        this.componentRef?.instance.cdr.markForCheck();
    }

    destroy(): void {
        super.destroy();
        this.componentRef?.destroy();
    }
}
