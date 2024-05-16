import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { PlaitBoard, PlaitPluginElementContext, OnContextChanged, ACTIVE_STROKE_WIDTH, RectangleClient, PlaitElement } from '@plait/core';
import { ActiveGenerator, canResize, CommonPluginElement } from '@plait/common';
import { PlaitTableCell, PlaitTable } from './interfaces/table';
import { PlaitDrawShapeText, TextGenerator } from './generators/text.generator';
import { TableGenerator } from './generators/table.generator';
import { TextManageRef } from '@plait/text';
import { DrawTransforms } from './transforms';
import { getCellsWithPoints } from './utils/table';
import { memorizeLatestText } from './utils';

@Component({
    selector: 'plait-draw-table',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class TableComponent<T extends PlaitElement = PlaitTable> extends CommonPluginElement<T, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<T, PlaitBoard> {
    activeGenerator!: ActiveGenerator<T>;

    tableGenerator!: TableGenerator<T>;

    textGenerator!: TextGenerator<T>;

    constructor() {
        super();
    }

    initializeGenerator() {
        this.activeGenerator = new ActiveGenerator<T>(this.board, {
            getStrokeWidth: () => {
                return ACTIVE_STROKE_WIDTH;
            },
            getStrokeOpacity: () => {
                return 1;
            },
            getRectangle: (element: T) => {
                return RectangleClient.getRectangleByPoints(element.points!);
            },
            hasResizeHandle: () => {
                return canResize(this.board, this.element);
            }
        });
        this.tableGenerator = new TableGenerator<T>(this.board);
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
        this.textGenerator = new TextGenerator(this.board, this.element, texts, this.viewContainerRef, {
            onValueChangeHandle: (textManageRef: TextManageRef, text: PlaitDrawShapeText) => {
                const cells = getCellsWithPoints((this.element as unknown) as PlaitTable);
                const height = textManageRef.height / this.board.viewport.zoom;
                const width = textManageRef.width / this.board.viewport.zoom;
                if (textManageRef.newValue) {
                    DrawTransforms.setTableText(
                        this.board,
                        (this.element as unknown) as PlaitTable,
                        cells.find(item => item.id === text.key)!,
                        textManageRef.newValue,
                        width,
                        height
                    );
                }
                textManageRef.operations && memorizeLatestText(this.element, textManageRef.operations);
            }
        });
        this.textGenerator.initialize();
    }

    onContextChanged(value: PlaitPluginElementContext<T, PlaitBoard>, previous: PlaitPluginElementContext<T, PlaitBoard>) {
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
