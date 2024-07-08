import { PlaitBoard, PlaitPluginElementContext, OnContextChanged } from '@plait/core';
import { PlaitVectorLine } from './interfaces';
import { LineActiveGenerator } from './generators/line-active.generator';
import { CommonElementFlavour } from '@plait/common';
import { getVectorLinePoints } from './utils';
import { VectorLineShapeGenerator } from './generators/vector-line-generator';

export class VectorLineComponent extends CommonElementFlavour<PlaitVectorLine, PlaitBoard>
    implements OnContextChanged<PlaitVectorLine, PlaitBoard> {
    shapeGenerator!: VectorLineShapeGenerator;

    activeGenerator!: LineActiveGenerator;

    constructor() {
        super();
    }

    initializeGenerator() {
        this.shapeGenerator = new VectorLineShapeGenerator(this.board);
        this.activeGenerator = new LineActiveGenerator(this.board);
    }

    initialize(): void {
        this.initializeGenerator();
        this.shapeGenerator.processDrawing(this.element, this.getElementG());
        const linePoints = getVectorLinePoints(this.board, this.element)!;
        this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
            selected: this.selected,
            linePoints
        });
        super.initialize();
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitVectorLine, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitVectorLine, PlaitBoard>
    ) {
        this.initializeWeakMap();
        const isChangeTheme = this.board.operations.find(op => op.type === 'set_theme');
        const linePoints = getVectorLinePoints(this.board, this.element)!;
        if (value.element !== previous.element || isChangeTheme) {
            this.shapeGenerator.processDrawing(this.element, this.getElementG());
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                selected: this.selected,
                linePoints
            });
        } else {
            const needUpdate = value.selected !== previous.selected || this.activeGenerator.needUpdate();
            if (needUpdate) {
                this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                    selected: this.selected,
                    linePoints
                });
            }
        }
    }

    destroy(): void {
        super.destroy();
        this.activeGenerator.destroy();
    }
}
