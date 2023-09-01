import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementComponent, PlaitPluginElementContext, OnContextChanged, getElementById } from '@plait/core';
import { Subject } from 'rxjs';
import { LineText, PlaitGeometry, PlaitLine } from './interfaces';
import { TextManage, TextManageRef, buildText } from '@plait/text';
import { LineShapeGenerator } from './generator/line.generator';
import { LineActiveGenerator } from './generator/line-active.generator';
import { getElbowPoints } from './utils';
import { getPointOnPolyline } from '@plait/common';
import { DrawTransforms } from './transforms';

interface BoundedElements {
    source?: PlaitGeometry;
    target?: PlaitGeometry;
}

@Component({
    selector: 'plait-draw-line',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineComponent extends PlaitPluginElementComponent<PlaitLine, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitLine, PlaitBoard> {
    destroy$ = new Subject<void>();

    shapeGenerator!: LineShapeGenerator;

    activeGenerator!: LineActiveGenerator;

    textManages: TextManage[] = [];

    boundedElements: BoundedElements = {};

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    initializeGenerator() {
        this.shapeGenerator = new LineShapeGenerator(this.board);
        this.activeGenerator = new LineActiveGenerator(this.board);
        this.initializeTextManage();
    }

    ngOnInit(): void {
        this.initializeGenerator();
        this.shapeGenerator.draw(this.element, this.g);
        this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
        super.ngOnInit();
        this.boundedElements = this.getBoundedElements();
        this.drawText();
    }

    getBoundedElements() {
        const boundedElements: BoundedElements = {};
        if (this.element.source.boundId) {
            const boundElement = getElementById<PlaitGeometry>(this.board, this.element.source.boundId);
            if (boundElement) {
                boundedElements.source = boundElement;
            }
        }
        if (this.element.target.boundId) {
            const boundElement = getElementById<PlaitGeometry>(this.board, this.element.target.boundId);
            if (boundElement) {
                boundedElements.target = boundElement;
            }
        }
        return boundedElements;
    }

    onContextChanged(value: PlaitPluginElementContext<PlaitLine, PlaitBoard>, previous: PlaitPluginElementContext<PlaitLine, PlaitBoard>) {
        const boundedElements = this.getBoundedElements();
        const isBoundedElementsChanged =
            boundedElements.source !== this.boundedElements.source || boundedElements.target !== this.boundedElements.target;
        this.boundedElements = boundedElements;

        if (value.element !== previous.element) {
            this.shapeGenerator.draw(this.element, this.g);
            this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
            this.updateText(previous.element.texts, value.element.texts);
            this.updateTextRectangle();
        }

        if (isBoundedElementsChanged) {
            this.shapeGenerator.draw(this.element, this.g);
            this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
            this.updateText(previous.element.texts, value.element.texts);
            this.updateTextRectangle();
            return;
        }

        const hasSameSelected = value.selected === previous.selected;
        if (!hasSameSelected) {
            this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
        }
    }

    initializeTextManage() {
        if (this.element.texts?.length) {
            this.element.texts.forEach((text, index) => {
                const manage = this.createTextManage(text, index);
                this.textManages.push(manage);
            });
        }
    }

    drawText() {
        if (this.element.texts?.length) {
            this.textManages.forEach((manage, index) => {
                manage.draw(this.element.texts![index].text);
                this.g.append(manage.g);
            });
        }
    }

    createTextManage(text: LineText, index: number) {
        return new TextManage(this.board, this.viewContainerRef, {
            getRectangle: () => {
                const points = getElbowPoints(this.board, this.element);
                const point = getPointOnPolyline(points, text.position);
                return {
                    x: point[0] - this.element.texts![index].width! / 2,
                    y: point[1] - this.element.texts![index].height! / 2,
                    width: this.element.texts![index].width!,
                    height: this.element.texts![index].height!
                };
            },
            onValueChangeHandle: (textManageRef: TextManageRef) => {
                const height = textManageRef.height / this.board.viewport.zoom;
                const width = textManageRef.width / this.board.viewport.zoom;
                if (textManageRef.newValue && this.element.texts) {
                    const texts: LineText[] = [];
                    this.element.texts.forEach((text, i) => {
                        if (i === index) {
                            texts.push({
                                text: textManageRef.newValue || buildText(''),
                                position: this.element.texts[index].position,
                                width,
                                height
                            });
                        } else {
                            texts.push(this.element.texts[i]);
                        }
                    });
                    DrawTransforms.setLineTexts(this.board, this.element, texts);
                }
            }
        });
    }

    updateText(previousTexts: LineText[], currentTexts: LineText[]) {
        if (previousTexts === currentTexts) return;
        const previousTextsLength = previousTexts.length;
        const currentTextsLength = currentTexts.length;
        for (let i = 0; i < Math.max(previousTextsLength, currentTextsLength); i++) {
            if (previousTexts[i] && currentTexts[i] && previousTexts[i].text !== currentTexts[i].text) {
                this.textManages[i].updateText(currentTexts[i].text);
            }
            if (!previousTexts[i] && currentTexts[i]) {
                this.textManages.push(this.createTextManage(currentTexts[i], i));
                this.textManages[i].draw(currentTexts[i].text);
                this.g.append(this.textManages[i].g);
            }
        }
    }

    updateTextRectangle() {
        this.textManages.forEach(manage => {
            manage.updateRectangle();
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
