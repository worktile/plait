import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import {
    PlaitBoard,
    PlaitPluginElementContext,
    OnContextChanged,
    ACTIVE_STROKE_WIDTH,
    RectangleClient,
    PlaitOptionsBoard
} from '@plait/core';
import {
    ActiveGenerator,
    canResize,
    CommonPluginElement,
    WithTextOptions,
    WithTextPluginKey
} from '@plait/common';
import { PlaitTable } from './interfaces/table';
import { TableGenerator } from './generators/table.generator';
import { TextManage, TextManageRef } from '@plait/text';
import { getEngine } from './engines';
import { getCellsWithPoints } from './utils/table';
import { getTextRectangle, memorizeLatestText } from './utils';
import { DrawTransforms } from './transforms';
import { PlaitText, TableSymbols } from './interfaces';
import { GeometryThreshold } from './constants';

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

    constructor() {
        super();
    }

    get _textManages() {
        return this.getTextManages();
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
        this.drawText();
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
        this.tableGenerator.processDrawing(this.element, this.getElementG());
        this.initializeTextManage();
    }

    initializeTextManage() {
        const plugins = ((this.board as PlaitOptionsBoard).getPluginOptions<WithTextOptions>(WithTextPluginKey) || {}).textPlugins;
        const manages = this.element.cells.map((_, index) => {
            return new TextManage(this.board, this.viewContainerRef, {
                getRectangle: () => {
                    const cells = getCellsWithPoints(this.element);
                    const getRectangle = getEngine(TableSymbols.table).getTextRectangle;
                    if (getRectangle) {
                        return getRectangle(cells[index]);
                    }
                    return getTextRectangle(cells[index]);
                },
                onValueChangeHandle: (textManageRef: TextManageRef) => {
                    const cells = getCellsWithPoints(this.element);
                    const height = textManageRef.height / this.board.viewport.zoom;
                    const width = textManageRef.width / this.board.viewport.zoom;
                    if (textManageRef.newValue) {
                        DrawTransforms.setTableText(this.board, this.element, cells[index], textManageRef.newValue, width, height);
                    }
                    textManageRef.operations && memorizeLatestText(this.element, textManageRef.operations);
                },
                getMaxWidth: () => {
                    const cells = getCellsWithPoints(this.element);
                    let width = getTextRectangle(cells[index]).width;
                    const getRectangle = getEngine(TableSymbols.table).getTextRectangle;
                    if (getRectangle) {
                        width = getRectangle(this.element).width;
                    }
                    return ((cells[index] as unknown) as PlaitText)?.autoSize ? GeometryThreshold.defaultTextMaxWidth : width;
                },
                textPlugins: plugins
            });
        });
        this.initializeTextManages(manages);
    }

    drawText() {
        this.element.cells.forEach((cell, index) => {
            const textManage = this._textManages[index];
            if (cell.text) {
                textManage.draw(cell.text);
                this.getElementG().append(textManage.g);
            }
        });
    }

    updateText() {
        this.element.cells.forEach((cell, index) => {
            const textManage = this._textManages[index];
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
    }
}
