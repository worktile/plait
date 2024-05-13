import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { PlaitBoard, PlaitPluginElementContext, OnContextChanged, ACTIVE_STROKE_WIDTH, RectangleClient } from '@plait/core';
import { ActiveGenerator, canResize, CommonPluginElement } from '@plait/common';
import { PlaitTable, PlaitTableCell } from './interfaces/table';
import { TableCellTextGenerator, TableGenerator } from './generators/table.generator';
import { TextManage, TextManageRef } from '@plait/text';
import { TextGenerator } from './generators/text.generator';
import { PlaitDrawShapeText, TableSymbols } from './interfaces';
import { getCellsWithPoints } from './utils/table';

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

    textGenerators!: TableCellTextGenerator[];

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
        this.textGenerators = this.element.cells.map(() => {
            return new TableCellTextGenerator(this.board);
        });
        this.initializeTextManage();
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
        this.tableGenerator.processDrawing(this.element, this.getElementG());
        this.drawText();
    }

    getDrawShapeTexts(cells: PlaitTableCell[]) {
        return cells.map(item => {
            return {
                key: item.id,
                text: item.text!,
                textHeight: item.textHeight!
            };
        });
    }

    initializeTextManage() {
        const texts: PlaitDrawShapeText[] = this.getDrawShapeTexts(this.element.cells);
        this.textGenerator = new TextGenerator(
            this.board,
            this.element,
            texts,
            TableSymbols.table,
            this.getElementG(),
            this.viewContainerRef
        );
        this.textGenerator.initialize();
        this.initializeTextManages(this.textGenerator.textManages);
    }

    drawText() {
        const textManages = this.getTextManages();
        this.textGenerator.draw(textManages);
    }

    updateText(previousTable: PlaitTable, currentTable: PlaitTable) {
        const textManages = this.getTextManages();
        const previousTexts: PlaitDrawShapeText[] = this.getDrawShapeTexts(previousTable.cells);
        const currentTexts: PlaitDrawShapeText[] = this.getDrawShapeTexts(currentTable.cells);
        this.textGenerator.update(this.element, previousTexts, currentTexts, textManages);
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitTable, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitTable, PlaitBoard>
    ) {
        this.initializeWeakMap();
        if (value.element !== previous.element) {
            this.tableGenerator.processDrawing(this.element, this.getElementG());
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
            this.updateText(previous.element, value.element);
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
        this.destroyTextManages();
    }
}
