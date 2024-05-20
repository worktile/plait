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

export class TableComponent extends CommonElementFlavour<PlaitTable, PlaitBoard> implements OnContextChanged<PlaitTable, PlaitBoard> {
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

    initialize(): void {
        super.initialize();
        this.initializeGenerator();
        this.tableGenerator.processDrawing(this.element, this.getElementG());
        this.textGenerator.draw(this.getElementG());
        this.rotateVerticalText();
    }

    rotateVerticalText() {
        this.element.cells.forEach(item => {
            if (PlaitTableElement.isVerticalText(item)) {
                const textManage = getTextManage(item.id);
                if (textManage) {
                    const engine = getEngine<PlaitTable>(TableSymbols.table);
                    const rectangle = engine.getTextRectangle!(this.element, { key: item.id });
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

    initializeTextManage() {
        const texts = this.getDrawShapeTexts(this.element.cells);
        this.textGenerator = new TextGenerator(this.board, this.element, texts, PlaitBoard.getViewContainerRef(this.board), {
            onValueChangeHandle: (textManageRef: TextManageRef, text: PlaitDrawShapeText) => {
                const cells = getCellsWithPoints(this.element);
                const height = textManageRef.height / this.board.viewport.zoom;
                const width = textManageRef.width / this.board.viewport.zoom;
                if (textManageRef.newValue) {
                    DrawTransforms.setTableText(
                        this.board,
                        this.element,
                        cells.find(item => item.id === text.key)!,
                        textManageRef.newValue,
                        width,
                        height
                    );
                }
                textManageRef.operations && memorizeLatestText(this.element, textManageRef.operations);
            },
            getRenderRectangle: (element: PlaitTable, text: PlaitDrawShapeText) => {
                const cell = getCellWithPoints(element, text.key);
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

    onContextChanged(
        value: PlaitPluginElementContext<PlaitTable, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitTable, PlaitBoard>
    ) {
        if (value.element !== previous.element) {
            this.tableGenerator.processDrawing(this.element, this.getElementG());
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
            const previousTexts = this.getDrawShapeTexts(previous.element.cells);
            const currentTexts = this.getDrawShapeTexts(this.element.cells);
            this.textGenerator.update(this.element, previousTexts, currentTexts, this.getElementG());
            this.rotateVerticalText();
        } else {
            const hasSameSelected = value.selected === previous.selected;
            const hasSameHandleState = this.activeGenerator.options.hasResizeHandle() === this.activeGenerator.hasResizeHandle;
            if (!hasSameSelected || !hasSameHandleState) {
                this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
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
