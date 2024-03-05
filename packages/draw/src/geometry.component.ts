import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import {
    PlaitBoard,
    PlaitPluginElementContext,
    OnContextChanged,
    isSelectionMoving,
    getSelectedElements,
    PlaitOptionsBoard,
    ACTIVE_STROKE_WIDTH,
    RectangleClient
} from '@plait/core';
import { Subject } from 'rxjs';
import { PlaitGeometry } from './interfaces/geometry';
import { GeometryShapeGenerator } from './generators/geometry-shape.generator';
import { TextManage, TextManageRef } from '@plait/text';
import { DrawTransforms } from './transforms';
import { getTextRectangle } from './utils/geometry';
import { ActiveGenerator, WithTextPluginKey, WithTextOptions, CommonPluginElement } from '@plait/common';
import { GeometryThreshold } from './constants/geometry';
import { PlaitDrawElement, PlaitText } from './interfaces';
import { getEngine } from './engines';
import { LineAutoCompleteGenerator } from './generators/line-auto-complete.generator';
import { memorizeLatestText } from './utils';

@Component({
    selector: 'plait-draw-geometry',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class GeometryComponent extends CommonPluginElement<PlaitGeometry, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitGeometry, PlaitBoard> {
    destroy$ = new Subject<void>();

    activeGenerator!: ActiveGenerator<PlaitGeometry>;

    lineAutoCompleteGenerator!: LineAutoCompleteGenerator;

    shapeGenerator!: GeometryShapeGenerator;

    get textManage() {
        return this.getTextManages()[0];
    }

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    initializeGenerator() {
        this.activeGenerator = new ActiveGenerator<PlaitGeometry>(this.board, {
            getStrokeWidth: () => {
                const selectedElements = getSelectedElements(this.board);
                if (selectedElements.length === 1 && !isSelectionMoving(this.board)) {
                    return ACTIVE_STROKE_WIDTH;
                } else {
                    return ACTIVE_STROKE_WIDTH;
                }
            },
            getStrokeOpacity: () => {
                const selectedElements = getSelectedElements(this.board);
                if (selectedElements.length === 1 && !isSelectionMoving(this.board)) {
                    return 1;
                } else {
                    return 0.5;
                }
            },
            getRectangle: (element: PlaitGeometry) => {
                return RectangleClient.getRectangleByPoints(element.points);
            },
            hasResizeHandle: () => {
                const selectedElements = getSelectedElements(this.board);
                if (PlaitBoard.hasBeenTextEditing(this.board) && PlaitDrawElement.isText(this.element)) {
                    return false;
                }
                return selectedElements.length === 1 && !isSelectionMoving(this.board);
            }
        });
        this.lineAutoCompleteGenerator = new LineAutoCompleteGenerator(this.board);
        this.shapeGenerator = new GeometryShapeGenerator(this.board);
        this.initializeTextManage();
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
        this.shapeGenerator.processDrawing(this.element, this.g);
        this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
        this.lineAutoCompleteGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
            selected: this.selected
        });
        this.drawText();
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitGeometry, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitGeometry, PlaitBoard>
    ) {
        const isChangeTheme = this.board.operations.find(op => op.type === 'set_theme');
        if (value.element !== previous.element || isChangeTheme) {
            this.shapeGenerator.processDrawing(this.element, this.g);
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
            this.lineAutoCompleteGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                selected: this.selected
            });
            this.updateText();
        } else {
            const hasSameSelected = value.selected === previous.selected;
            const hasSameHandleState = this.activeGenerator.options.hasResizeHandle() === this.activeGenerator.hasResizeHandle;
            if (!hasSameSelected || !hasSameHandleState) {
                this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
                this.lineAutoCompleteGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                    selected: this.selected
                });
            }
        }
    }

    editText() {
        this.textManage.edit();
        this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
    }

    drawText() {
        this.textManage.draw(this.element.text);
        this.g.append(this.textManage.g);
        const centerPoint = RectangleClient.getCenterPoint(this.board.getRectangle(this.element)!);
        this.textManage.updateRotate(centerPoint, this.element.angle);
    }

    updateText() {
        this.textManage.updateText(this.element.text);
        this.textManage.updateRectangle();
        const centerPoint = RectangleClient.getCenterPoint(this.board.getRectangle(this.element)!);
        this.textManage.updateRotate(centerPoint, this.element.angle);
    }

    initializeTextManage() {
        const plugins = ((this.board as PlaitOptionsBoard).getPluginOptions<WithTextOptions>(WithTextPluginKey) || {}).textPlugins;

        const manage = new TextManage(this.board, this.viewContainerRef, {
            getRectangle: () => {
                const getRectangle = getEngine(this.element.shape).getTextRectangle;
                if (getRectangle) {
                    return getRectangle(this.element);
                }
                return getTextRectangle(this.element);
            },
            onValueChangeHandle: (textManageRef: TextManageRef) => {
                const height = textManageRef.height / this.board.viewport.zoom;
                const width = textManageRef.width / this.board.viewport.zoom;
                if (textManageRef.newValue) {
                    DrawTransforms.setText(this.board, this.element, textManageRef.newValue, width, height);
                } else {
                    DrawTransforms.setTextSize(this.board, this.element, width, height);
                }
                textManageRef.operations && memorizeLatestText(this.element, textManageRef.operations);
            },
            getMaxWidth: () => {
                let width = getTextRectangle(this.element).width;
                const getRectangle = getEngine(this.element.shape).getTextRectangle;
                if (getRectangle) {
                    width = getRectangle(this.element).width;
                }
                return (this.element as PlaitText)?.autoSize ? GeometryThreshold.defaultTextMaxWidth : width;
            },
            textPlugins: plugins
        });
        this.initializeTextManages([manage]);
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.textManage.destroy();
        this.destroy$.next();
        this.destroy$.complete();
        this.activeGenerator.destroy();
        this.lineAutoCompleteGenerator.destroy();
    }
}
