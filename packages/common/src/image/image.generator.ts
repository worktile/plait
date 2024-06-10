import {
    ACTIVE_STROKE_WIDTH,
    PlaitBoard,
    PlaitElement,
    RectangleClient,
    createForeignObject,
    createG,
    getSelectedElements,
    isSelectionMoving,
    setAngleForG,
    updateForeignObject
} from '@plait/core';
import { Generator, GeneratorExtraData, GeneratorOptions } from '../generators/generator';
import { CommonImageItem, canResize, getElementOfFocusedImage } from '../utils';
import { ActiveGenerator } from '../generators/active.generator';
import { PlaitImageBoard, ImageComponentRef, ImageProps } from './with-image';

export interface ImageGeneratorOptions<T> {
    getRectangle: (element: T) => RectangleClient;
    getImageItem: (element: T) => CommonImageItem;
}

export class ImageGenerator<T extends PlaitElement = PlaitElement> extends Generator<
    T,
    GeneratorExtraData,
    ImageGeneratorOptions<T> & GeneratorOptions
> {
    static key = 'image-generator';

    foreignObject!: SVGForeignObjectElement;

    imageComponentRef!: ImageComponentRef;

    activeGenerator!: ActiveGenerator;

    isFocus = false;

    element!: T;

    constructor(public board: PlaitBoard, public options: ImageGeneratorOptions<T>) {
        super(board, options);
    }

    canDraw(element: T): boolean {
        return !!this.options.getImageItem(element);
    }

    draw(element: T): SVGGElement {
        this.element = element;
        const g = createG();
        const foreignRectangle = this.options.getRectangle(element);
        this.foreignObject = createForeignObject(foreignRectangle.x, foreignRectangle.y, foreignRectangle.width, foreignRectangle.height);
        g.append(this.foreignObject);
        const props: ImageProps = {
            board: this.board,
            imageItem: this.options.getImageItem(element),
            element,
            getRectangle: () => {
                return this.options.getRectangle(element);
            }
        };
        this.imageComponentRef = ((this.board as unknown) as PlaitImageBoard).renderImage(this.foreignObject, props);

        this.activeGenerator = new ActiveGenerator(this.board, {
            getStrokeWidth: () => {
                const selectedElements = getSelectedElements(this.board);
                if (!(selectedElements.length === 1 && !isSelectionMoving(this.board))) {
                    return ACTIVE_STROKE_WIDTH;
                } else {
                    return ACTIVE_STROKE_WIDTH;
                }
            },
            getStrokeOpacity: () => {
                const selectedElements = getSelectedElements(this.board);
                if ((selectedElements.length === 1 && !isSelectionMoving(this.board)) || !selectedElements.length) {
                    return 1;
                } else {
                    return 0.5;
                }
            },
            getRectangle: () => {
                return this.options.getRectangle(this.element);
            },
            hasResizeHandle: () => {
                const isSelectedImageElement = canResize(this.board, this.element);
                const isSelectedImage = !!getElementOfFocusedImage(this.board);
                return isSelectedImage || isSelectedImageElement;
            }
        });
        return g;
    }

    updateImage(nodeG: SVGGElement, previous: T, current: T) {
        this.element = current;
        if (previous !== current && this.imageComponentRef) {
            const props = {
                imageItem: this.options.getImageItem(current),
                element: current,
                getRectangle: () => {
                    return this.options.getRectangle(current);
                }
            };
            this.imageComponentRef.update(props);
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
        const activeG = PlaitBoard.getElementActiveHost(this.board);
        this.activeGenerator.processDrawing(current, activeG, { selected: this.isFocus });
    }

    setFocus(element: PlaitElement, isFocus: boolean) {
        this.isFocus = isFocus;
        const activeG = PlaitBoard.getElementActiveHost(this.board);
        this.activeGenerator.processDrawing(element, activeG, { selected: isFocus });
        const props: Partial<ImageProps> = {
            isFocus
        };
        this.imageComponentRef.update(props);
    }

    destroy(): void {
        super.destroy();
        this.imageComponentRef?.destroy();
        this.activeGenerator?.destroy();
    }
}
