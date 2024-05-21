import {
    PlaitBoard,
    PlaitPluginElementContext,
    OnContextChanged,
    ACTIVE_STROKE_WIDTH,
    RectangleClient,
    setAngleForG,
    degreesToRadians
} from '@plait/core';
import { ActiveGenerator, CommonElementFlavour, canResize } from '@plait/common';
import { PlaitTable, PlaitTableCell, PlaitTableElement } from './interfaces/table';
import { getTextManage, PlaitDrawShapeText, TextGenerator } from './generators/text.generator';
import { TableGenerator } from './generators/table.generator';
import { TextManageRef } from '@plait/text';
import { DrawTransforms } from './transforms';
import { getCellsWithPoints, getCellWithPoints } from './utils/table';
import { getStrokeWidthByElement, memorizeLatestText } from './utils';
import { getEngine } from './engines';
import { TableSymbols } from './interfaces';
import { getHorizontalTextRectangle } from './engines/table/table';
import { ShapeDefaultSpace } from './constants';

export class TableComponent<T extends PlaitTable> extends CommonElementFlavour<T, PlaitBoard> implements OnContextChanged<T, PlaitBoard> {
    activeGenerator!: ActiveGenerator<T>;

    tableGenerator!: TableGenerator<T>;

    textGenerator!: TextGenerator<T>;

    constructor() {
        super();
    }

    initializeGenerator(element: T = this.element) {
        this.activeGenerator = new ActiveGenerator<T>(this.board, {
            getStrokeWidth: () => {
                return ACTIVE_STROKE_WIDTH;
            },
            getStrokeOpacity: () => {
                return 1;
            },
            getRectangle: (value: T) => {
                return RectangleClient.getRectangleByPoints(value.points!);
            },
            hasResizeHandle: () => {
                return canResize(this.board, element);
            }
        });
        this.tableGenerator = new TableGenerator<T>(this.board);
        this.initializeTextManage(element);
    }

    initialize(element: T = this.element): void {
        super.initialize();
        this.initializeGenerator(element);
        this.draw(element);
    }

    draw(element: T = this.element) {
        this.tableGenerator.processDrawing(element, this.getElementG());
        this.textGenerator.draw(this.getElementG());
        this.rotateVerticalText(element);
    }

    rotateVerticalText(element: T = this.element) {
        element.cells.forEach(item => {
            if (PlaitTableElement.isVerticalText(item)) {
                const textManage = getTextManage(item.id);
                if (textManage) {
                    const engine = getEngine<PlaitTable>(TableSymbols.table);
                    const rectangle = engine.getTextRectangle!(element, { key: item.id });
                    textManage.g.classList.add('vertical-cell-text');
                    setAngleForG(textManage.g, RectangleClient.getCenterPoint(rectangle), degreesToRadians(-90));
                }
            }
        });
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

    initializeTextManage(element: T = this.element) {
        const texts = this.getDrawShapeTexts(element.cells);
        this.textGenerator = new TextGenerator(this.board, element, texts, PlaitBoard.getViewContainerRef(this.board), {
            onValueChangeHandle: (value: PlaitTable, textManageRef: TextManageRef, text: PlaitDrawShapeText) => {
                const cells = getCellsWithPoints(value);
                const height = textManageRef.height / this.board.viewport.zoom;
                const width = textManageRef.width / this.board.viewport.zoom;
                if (textManageRef.newValue) {
                    DrawTransforms.setTableText(
                        this.board,
                        value,
                        cells.find(item => item.id === text.key)!,
                        textManageRef.newValue,
                        width,
                        height
                    );
                }
                textManageRef.operations && memorizeLatestText(value, textManageRef.operations);
            },
            getRenderRectangle: (value: PlaitTable, text: PlaitDrawShapeText) => {
                const cell = getCellWithPoints(value, text.key);
                if (PlaitTableElement.isVerticalText(cell)) {
                    const cellRectangle = RectangleClient.getRectangleByPoints(cell.points);
                    const strokeWidth = getStrokeWidthByElement(cell);
                    const width = cell.textHeight || 0;
                    const height = cellRectangle.height - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
                    return {
                        width,
                        height: height > 0 ? height : 0,
                        x: cellRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
                        y: cellRectangle.y + (cellRectangle.height - height) / 2
                    };
                } else {
                    return getHorizontalTextRectangle(cell);
                }
            }
        });
        this.textGenerator.initialize();
    }

    onContextChanged(value: PlaitPluginElementContext<T, PlaitBoard>, previous: PlaitPluginElementContext<T, PlaitBoard>) {
        if (value.element !== previous.element) {
            this.tableGenerator.processDrawing(value.element, this.getElementG());
            this.activeGenerator.processDrawing(value.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
            const previousTexts = this.getDrawShapeTexts(previous.element.cells);
            const currentTexts = this.getDrawShapeTexts(value.element.cells);
            this.textGenerator.update(value.element, previousTexts, currentTexts, this.getElementG());
            this.rotateVerticalText(value.element);
        } else {
            const hasSameSelected = value.selected === previous.selected;
            const hasSameHandleState = this.activeGenerator.options.hasResizeHandle() === this.activeGenerator.hasResizeHandle;
            if (!hasSameSelected || !hasSameHandleState) {
                this.activeGenerator.processDrawing(value.element, PlaitBoard.getElementActiveHost(this.board), {
                    selected: this.selected
                });
            }
        }
    }

    destroy(): void {
        super.destroy();
        this.activeGenerator.destroy();
        this.tableGenerator.destroy();
        this.textGenerator.destroy();
    }
}
