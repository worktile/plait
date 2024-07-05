import { PlaitBoard, PlaitPluginElementContext, OnContextChanged, createDebugGenerator } from '@plait/core';
import { PlaitVectorLine } from './interfaces';
import { LineActiveGenerator } from './generators/line-active.generator';
import { CommonElementFlavour } from '@plait/common';
import { getVectorLinePoints } from './utils';
import { VectorLineGenerator } from './generators/vector-line-generator';

const debugKey = 'debug:plait:vector-line-turning';
const debugGenerator = createDebugGenerator(debugKey);

export class VectorLineComponent extends CommonElementFlavour<PlaitVectorLine, PlaitBoard>
    implements OnContextChanged<PlaitVectorLine, PlaitBoard> {
    shapeGenerator!: VectorLineGenerator;

    activeGenerator!: LineActiveGenerator;

    constructor() {
        super();
    }

    initializeGenerator() {
        this.shapeGenerator = new VectorLineGenerator(this.board);
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

        debugGenerator.isDebug() && debugGenerator.drawCircles(this.board, this.element.points.slice(1, -1), 4, true);
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
