import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import {
    PlaitBoard,
    PlaitPluginElementComponent,
    PlaitPluginElementContext,
    OnContextChanged,
    isSelectionMoving,
    getSelectedElements
} from '@plait/core';
import { Subject } from 'rxjs';
import { PlaitGeometry } from './interfaces/geometry';
import { GeometryShapeGenerator } from './generator/geometry-shape.generator';
import { TextManage, TextManageRef } from '@plait/text';
import { DrawTransforms } from './transforms';
import { getTextRectangle } from './utils/geometry';
import { ActiveGenerator, getRectangleByPoints } from '@plait/common';
import { DefaultGeometryActiveStyle, GeometryThreshold } from './constants/geometry';
import { getStrokeWidthByElement } from './utils/geometry-style/stroke';
import { PlaitDrawElement, PlaitText } from './interfaces';

@Component({
    selector: 'plait-draw-geometry',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeometryComponent extends PlaitPluginElementComponent<PlaitGeometry, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitGeometry, PlaitBoard> {
    destroy$ = new Subject<void>();

    activeGenerator!: ActiveGenerator<PlaitGeometry>;

    shapeGenerator!: GeometryShapeGenerator;

    textManage!: TextManage;

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    initializeGenerator() {
        this.activeGenerator = new ActiveGenerator<PlaitGeometry>(this.board, {
            getStrokeWidth: () => {
                const selectedElements = getSelectedElements(this.board);
                if (selectedElements.length === 1 && !isSelectionMoving(this.board)) {
                    return DefaultGeometryActiveStyle.strokeWidth;
                } else {
                    return DefaultGeometryActiveStyle.selectionStrokeWidth;
                }
            },
            getRectangle: (element: PlaitGeometry) => {
                return getRectangleByPoints(element.points);
            },
            getStrokeWidthByElement: (element: PlaitGeometry) => {
                return getStrokeWidthByElement(element);
            },
            hasResizeHandle: () => {
                const selectedElements = getSelectedElements(this.board);
                if (PlaitBoard.hasBeenTextEditing(this.board) && PlaitDrawElement.isText(this.element)) {
                    return false;
                }
                return selectedElements.length === 1 && !isSelectionMoving(this.board);
            }
        });
        this.shapeGenerator = new GeometryShapeGenerator(this.board);
        this.initializeTextManage();
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
        this.shapeGenerator.draw(this.element, this.g);
        this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
        this.drawText();
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitGeometry, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitGeometry, PlaitBoard>
    ) {
        if (value.element !== previous.element) {
            this.shapeGenerator.draw(this.element, this.g);
            this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
            this.updateText();
        } else {
            const hasSameSelected = value.selected === previous.selected;
            const hasSameHandleState = this.activeGenerator.options.hasResizeHandle() === this.activeGenerator.hasResizeHandle;
            if (!hasSameSelected || !hasSameHandleState) {
                this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
            }
        }
    }

    editText() {
        this.textManage.edit();
        this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
    }

    drawText() {
        this.textManage.draw(this.element.text);
        this.g.append(this.textManage.g);
    }

    updateText() {
        this.textManage.updateText(this.element.text);
        this.textManage.updateRectangle();
    }

    initializeTextManage() {
        this.textManage = new TextManage(this.board, this.viewContainerRef, {
            getRectangle: () => {
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
            },
            getMaxWidth: () => {
                const width = getTextRectangle(this.element).width;
                return (this.element as PlaitText)?.autoSize ? GeometryThreshold.defaultTextMaxWidth : width;
            }
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.textManage.destroy();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
