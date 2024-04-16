import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementContext, OnContextChanged, getElementById, createDebugGenerator } from '@plait/core';
import { Subject } from 'rxjs';
import { LineText, PlaitGeometry, PlaitLine } from './interfaces';
import { TextManage, TextManageRef } from '@plait/text';
import { LineShapeGenerator } from './generators/line.generator';
import { LineActiveGenerator } from './generators/line-active.generator';
import { DrawTransforms } from './transforms';
import { GeometryThreshold } from './constants';
import { CommonPluginElement } from '@plait/common';
import { getLinePoints, getLineTextRectangle } from './utils/line/line-basic';
import { memorizeLatestText } from './utils/memorize';

interface BoundedElements {
    source?: PlaitGeometry;
    target?: PlaitGeometry;
}

const debugKey = 'debug:plait:line-turning';
const debugGenerator = createDebugGenerator(debugKey);

@Component({
    selector: 'plait-draw-line',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class LineComponent extends CommonPluginElement<PlaitLine, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitLine, PlaitBoard> {
    destroy$ = new Subject<void>();

    shapeGenerator!: LineShapeGenerator;

    activeGenerator!: LineActiveGenerator;

    boundedElements: BoundedElements = {};

    constructor(protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    initializeGenerator() {
        this.shapeGenerator = new LineShapeGenerator(this.board);
        this.activeGenerator = new LineActiveGenerator(this.board);
        this.initializeTextManagesByElement();
    }

    ngOnInit(): void {
        this.initializeGenerator();
        this.shapeGenerator.processDrawing(this.element, this.getElementG());
        const linePoints = getLinePoints(this.board, this.element);
        this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
            selected: this.selected,
            linePoints
        });
        super.ngOnInit();
        this.boundedElements = this.getBoundedElements();
        this.drawText();

        debugGenerator.isDebug() && debugGenerator.drawCircles(this.board, this.element.points.slice(1, -1), 4, true);
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
        const isChangeTheme = this.board.operations.find(op => op.type === 'set_theme');
        const linePoints = getLinePoints(this.board, this.element);
        if (value.element !== previous.element || isChangeTheme) {
            this.shapeGenerator.processDrawing(this.element, this.getElementG());
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                selected: this.selected,
                linePoints
            });
            this.updateText(previous.element.texts, value.element.texts);
            this.updateTextRectangle();
        } else {
            const needUpdate = value.selected !== previous.selected || this.activeGenerator.needUpdate();
            if (needUpdate) {
                this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                    selected: this.selected,
                    linePoints
                });
            }
        }
        if (isBoundedElementsChanged) {
            this.shapeGenerator.processDrawing(this.element, this.getElementG());
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                selected: this.selected,
                linePoints
            });
            this.updateTextRectangle();
            return;
        }
    }

    initializeTextManagesByElement() {
        if (this.element.texts?.length) {
            const textManages: TextManage[] = [];
            this.element.texts.forEach((text, index) => {
                const manage = this.createTextManage(text, index);
                textManages.push(manage);
            });
            this.initializeTextManages(textManages);
        }
    }

    drawText() {
        if (this.element.texts?.length) {
            this.getTextManages().forEach((manage, index) => {
                manage.draw(this.element.texts![index].text);
                this.getElementG().append(manage.g);
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
                const texts = [...this.element.texts];
                texts.splice(index, 1, {
                    text: textManageRef.newValue ? textManageRef.newValue : this.element.texts[index].text,
                    position: this.element.texts[index].position,
                    width,
                    height
                });
                DrawTransforms.setLineTexts(this.board, this.element, texts);
                textManageRef.operations && memorizeLatestText(this.element, textManageRef.operations);
            },
            getMaxWidth: () => GeometryThreshold.defaultTextMaxWidth
        });
    }

    updateText(previousTexts: LineText[], currentTexts: LineText[]) {
        if (previousTexts === currentTexts) return;
        const previousTextsLength = previousTexts.length;
        const currentTextsLength = currentTexts.length;
        const textManages = this.getTextManages();
        if (currentTextsLength === previousTextsLength) {
            for (let i = 0; i < previousTextsLength; i++) {
                if (previousTexts[i].text !== currentTexts[i].text) {
                    textManages[i].updateText(currentTexts[i].text);
                }
            }
        } else {
            this.destroyTextManages();
            this.initializeTextManagesByElement();
            this.drawText();
        }
    }

    updateTextRectangle() {
        const textManages = this.getTextManages();
        textManages.forEach(manage => {
            manage.updateRectangle();
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.activeGenerator.destroy();
        this.destroy$.next();
        this.destroy$.complete();
        this.destroyTextManages();
    }
}
