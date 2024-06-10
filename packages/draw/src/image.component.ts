import { PlaitBoard, PlaitPluginElementContext, OnContextChanged } from '@plait/core';
import { CommonElementFlavour, ImageGenerator } from '@plait/common';
import { PlaitImage } from './interfaces/image';
import { LineAutoCompleteGenerator } from './generators/line-auto-complete.generator';

export class ImageComponent extends CommonElementFlavour<PlaitImage, PlaitBoard> implements OnContextChanged<PlaitImage, PlaitBoard> {
    imageGenerator!: ImageGenerator<PlaitImage>;

    lineAutoCompleteGenerator!: LineAutoCompleteGenerator<PlaitImage>;

    constructor() {
        super();
    }

    initializeGenerator() {
        this.imageGenerator = new ImageGenerator<PlaitImage>(this.board, {
            getRectangle: (element: PlaitImage) => {
                return {
                    x: element.points[0][0],
                    y: element.points[0][1],
                    width: element.points[1][0] - element.points[0][0],
                    height: element.points[1][1] - element.points[0][1]
                };
            },
            getImageItem: element => {
                return {
                    url: element.url,
                    width: element.points[1][0] - element.points[0][0],
                    height: element.points[1][1] - element.points[0][1]
                };
            }
        });
        this.lineAutoCompleteGenerator = new LineAutoCompleteGenerator(this.board);
        this.getRef().addGenerator(LineAutoCompleteGenerator.key, this.lineAutoCompleteGenerator);
    }

    initialize(): void {
        super.initialize();
        this.initializeGenerator();
        this.imageGenerator.processDrawing(this.element, this.getElementG());
        this.lineAutoCompleteGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
            selected: this.selected
        });
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitImage, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitImage, PlaitBoard>
    ) {
        if (value.element !== previous.element) {
            this.imageGenerator.updateImage(this.getElementG(), previous.element, value.element);
            this.imageGenerator.setFocus(this.element, this.selected);
            this.lineAutoCompleteGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                selected: this.selected
            });
        } else {
            const hasSameSelected = value.selected === previous.selected;
            const hasSameHandleState =
                this.imageGenerator.activeGenerator &&
                this.imageGenerator.activeGenerator.options.hasResizeHandle() === this.imageGenerator.activeGenerator.hasResizeHandle;
            if (!hasSameSelected || !hasSameHandleState) {
                this.imageGenerator.setFocus(this.element, this.selected);
                this.lineAutoCompleteGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                    selected: this.selected
                });
            }
        }
    }

    destroy(): void {
        super.destroy();
        this.imageGenerator.destroy();
        this.lineAutoCompleteGenerator.destroy();
    }
}
