import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementComponent, PlaitPluginElementContext, OnContextChanged, updateForeignObject } from '@plait/core';
import { Subject } from 'rxjs';
import { PlaitGeometry } from './interfaces/geometry';
import { GeometryActiveGenerator } from './generator/geometry-active.generator';
import { GeometryShapeGenerator } from './generator/geometry-shape.generator';
import { TextManage, TextManageRef } from '@plait/text';
import { DrawTransform } from './transforms';
import { getTextRectangle } from './utils/geometry';
import { PlaitText } from './interfaces';
import { DefaultTextProperty } from './constants';

@Component({
    selector: 'plait-draw-geometry',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeometryComponent extends PlaitPluginElementComponent<PlaitGeometry, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitGeometry, PlaitBoard> {
    destroy$ = new Subject<void>();

    activeGenerator!: GeometryActiveGenerator;

    shapeGenerator!: GeometryShapeGenerator;

    textManage!: TextManage;

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    initializeGenerator() {
        this.activeGenerator = new GeometryActiveGenerator(this.board);
        this.shapeGenerator = new GeometryShapeGenerator(this.board);
        this.initializeTextManage();
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
        this.shapeGenerator.draw(this.element, this.g);
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
            if (!hasSameSelected) {
                this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
            }
        }
    }

    editText() {
        this.textManage.edit();
    }

    drawText() {
        this.textManage.draw(this.element.text);
        this.g.append(this.textManage.g);
    }

    updateText() {
        this.textManage.updateText(this.element.text);
        this.textManage.updateRectangle();
        if (!(this.element as PlaitText)?.autoSize) {
            const textWidth = getTextRectangle(this.element).width;
            this.textManage.updateWidth(textWidth);
        }
    }

    initializeTextManage() {
        const width = getTextRectangle(this.element).width;
        this.textManage = new TextManage(this.board, this.viewContainerRef, {
            getRectangle: () => {
                return getTextRectangle(this.element);
            },
            onValueChangeHandle: (textManageRef: TextManageRef) => {
                const height = textManageRef.height / this.board.viewport.zoom;
                const width = textManageRef.width / this.board.viewport.zoom;

                if (textManageRef.newValue) {
                    DrawTransform.setText(this.board, this.element, textManageRef.newValue, width, height);
                } else {
                    DrawTransform.setTextSize(this.board, this.element, width, height);
                }
            },
            maxWidth: (this.element as PlaitText)?.autoSize ? DefaultTextProperty.maxWidth : width
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.textManage.destroy();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
