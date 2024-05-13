import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { PlaitBoard, PlaitPluginElementContext, OnContextChanged, ACTIVE_STROKE_WIDTH, RectangleClient } from '@plait/core';
import { ActiveGenerator, canResize, CommonPluginElement } from '@plait/common';
import { PlaitTable, PlaitTableCell } from './interfaces/table';
import { PlaitDrawShapeText, TextGenerator } from './generators/text.generator';
import { TableGenerator } from './generators/table.generator';

@Component({
    selector: 'plait-draw-table',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class TableComponent extends CommonPluginElement<PlaitTable, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitTable, PlaitBoard> {
    activeGenerator!: ActiveGenerator<PlaitTable>;

    tableGenerator!: TableGenerator;

    textGenerator!: TextGenerator<PlaitTable>;

    constructor() {
        super();
    }

    initializeGenerator() {
        this.activeGenerator = new ActiveGenerator<PlaitTable>(this.board, {
            getStrokeWidth: () => {
                return ACTIVE_STROKE_WIDTH;
            },
            getStrokeOpacity: () => {
                return 1;
            },
            getRectangle: (element: PlaitTable) => {
                return RectangleClient.getRectangleByPoints(element.points);
            },
            hasResizeHandle: () => {
                return canResize(this.board, this.element);
            }
        });
        this.tableGenerator = new TableGenerator(this.board);
        this.initializeTextManage();
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
        this.tableGenerator.processDrawing(this.element, this.getElementG());
        this.textGenerator.draw(this.getElementG());
    }

    getDrawShapeTexts(cells: PlaitTableCell[]): PlaitDrawShapeText[] {
        return cells.map(item => {
            return {
                key: item.id,
                text: item.text!,
                textHeight: item.textHeight!
            };
        });
    }

    initializeTextManage() {
        const texts = this.getDrawShapeTexts(this.element.cells);
        this.textGenerator = new TextGenerator(this.board, this.element, texts, this.viewContainerRef);
        this.textGenerator.initialize();
        this.initializeTextManages(this.textGenerator.textManages);
    }

    updateText(previousTable: PlaitTable, currentTable: PlaitTable) {
        const previousTexts = this.getDrawShapeTexts(previousTable.cells);
        const currentTexts = this.getDrawShapeTexts(currentTable.cells);
        this.textGenerator.update(this.element, previousTexts, currentTexts, this.getElementG());
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitTable, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitTable, PlaitBoard>
    ) {
        this.initializeWeakMap();
        if (value.element !== previous.element) {
            this.tableGenerator.processDrawing(this.element, this.getElementG());
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
            const previousTexts = this.getDrawShapeTexts(previous.element.cells);
            const currentTexts = this.getDrawShapeTexts(this.element.cells);
            this.textGenerator.update(this.element, previousTexts, currentTexts, this.getElementG());
        } else {
            const hasSameSelected = value.selected === previous.selected;
            const hasSameHandleState = this.activeGenerator.options.hasResizeHandle() === this.activeGenerator.hasResizeHandle;
            if (!hasSameSelected || !hasSameHandleState) {
                this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
            }
        }
    }
    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.activeGenerator.destroy();
        this.tableGenerator.destroy();
        this.textGenerator.destroy();
    }
}
