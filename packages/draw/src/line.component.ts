import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementComponent, PlaitPluginElementContext, OnContextChanged, getElementById } from '@plait/core';
import { Subject } from 'rxjs';
import { LineText, PlaitGeometry, PlaitLine } from './interfaces';
import { TextManage, TextManageRef, buildText } from '@plait/text';
import { LineShapeGenerator } from './generator/line.generator';
import { LineActiveGenerator } from './generator/line-active.generator';
import { getLineTextRectangle } from './utils';
import { DrawTransforms } from './transforms';
import { GeometryThreshold } from './constants';

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
        this.initializeTextManages();
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
            this.updateTextRectangle();
            return;
        }

        const hasSameSelected = value.selected === previous.selected;
        if (!hasSameSelected) {
            this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
        }
    }

    initializeTextManages() {
        if (this.element.texts?.length) {
            this.element.texts.forEach((text, index) => {
                const manage = this.createTextManage(text, index);
                this.textManages.push(manage);
            });
        }
    }

    destroyTextManages() {
        this.textManages.forEach(manage => {
            manage.destroy();
        });
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
                return getLineTextRectangle(this.board, this.element, index);
            },
            onValueChangeHandle: (textManageRef: TextManageRef) => {
                const height = textManageRef.height / this.board.viewport.zoom;
                const width = textManageRef.width / this.board.viewport.zoom;
                const texts = JSON.parse(JSON.stringify(this.element.texts)) as LineText[];
                texts.splice(index, 1, {
                    text: textManageRef.newValue ? textManageRef.newValue : this.element.texts[index].text,
                    position: this.element.texts[index].position,
                    width,
                    height
                });
                DrawTransforms.setLineTexts(this.board, this.element, texts);
            },
            maxWidth: GeometryThreshold.defaultTextMaxWidth
        });
    }

    updateText(previousTexts: LineText[], currentTexts: LineText[]) {
        if (previousTexts === currentTexts) return;
        const previousTextsLength = previousTexts.length;
        const currentTextsLength = currentTexts.length;
        if (currentTextsLength === previousTextsLength) {
            for (let i = 0; i < previousTextsLength; i++) {
                if (previousTexts[i].text !== currentTexts[i].text) {
                    this.textManages[i].updateText(currentTexts[i].text);
                }
            }
        } else {
            this.destroyTextManages();
            this.textManages = [];
            this.initializeTextManages();
            this.drawText();
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
