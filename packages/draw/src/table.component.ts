import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { PlaitBoard, PlaitPluginElementContext, OnContextChanged, ACTIVE_STROKE_WIDTH, RectangleClient } from '@plait/core';
import { ActiveGenerator, canResize, CommonPluginElement } from '@plait/common';
import { PlaitTable } from './interfaces/table';
import { TableCellTextGenerator, TableGenerator } from './generators/table.generator';
import { TextManage, TextManageRef } from '@plait/text';

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

    initializeTextManage() {
        const manages = this.textGenerators.map((textGenerator, index) => {
            return new TextManage(this.board, this.viewContainerRef, {
                getRectangle: () => {
                    return textGenerator.getRectangle(this.element, index);
                },
                onValueChangeHandle: (textManageRef: TextManageRef) => {
                    return textGenerator.onValueChangeHandle(textManageRef, this.element, index);
                },
                getMaxWidth: () => {
                    return textGenerator.getMaxWidth(this.element, index);
                },
                textPlugins: textGenerator.textPlugins
            });
        });
        this.initializeTextManages(manages);
    }

    drawText() {
        const textManages = this.getTextManages();
        this.element.cells.forEach((cell, index) => {
            const textManage = textManages[index];
            if (cell.text) {
                textManage.draw(cell.text);
                this.getElementG().append(textManage.g);
            }
        });
    }

    updateText() {
        const textManages = this.getTextManages();
        this.element.cells.forEach((cell, index) => {
            const textManage = textManages[index];
            if (cell.text) {
                textManage.updateText(cell.text);
                textManage.updateRectangle();
            }
        });
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitTable, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitTable, PlaitBoard>
    ) {
        this.initializeWeakMap();
        if (value.element !== previous.element) {
            this.tableGenerator.processDrawing(this.element, this.getElementG());
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
            this.updateText();
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
