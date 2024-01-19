import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import {
    PlaitBoard,
    PlaitPluginElementContext,
    OnContextChanged,
    getElementById,
    isSelectionMoving,
    SetNodeOperation,
    Point,
    isHorizontalSegment,
    isVerticalSegment
} from '@plait/core';
import { Subject } from 'rxjs';
import { LineText, PlaitGeometry, PlaitLine } from './interfaces';
import { TextManage, TextManageRef } from '@plait/text';
import { LineShapeGenerator } from './generators/line.generator';
import { LineActiveGenerator } from './generators/line-active.generator';
import { getLineTextRectangle, memorizeLatestText } from './utils';
import { DrawTransforms } from './transforms';
import { GeometryThreshold } from './constants';
import { CommonPluginElement, getPoints } from '@plait/common';

interface BoundedElements {
    source?: PlaitGeometry;
    target?: PlaitGeometry;
}

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

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    initializeGenerator() {
        this.shapeGenerator = new LineShapeGenerator(this.board);
        this.activeGenerator = new LineActiveGenerator(this.board);
        this.initializeTextManagesByElement();
    }
    xxxxx: SVGGElement[] = [];
    ngOnInit(): void {
        this.initializeGenerator();
        this.shapeGenerator.processDrawing(this.element, this.g);
        this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
        super.ngOnInit();
        this.boundedElements = this.getBoundedElements();
        this.drawText();

        this.xxxxx.forEach(g => g.remove());
        this.xxxxx = [];
        const points = this.element.points;
        points.forEach((p, index) => {
            if (index === 0) {
                return;
            }
            if (index === points.length - 1) {
                return;
            }
            const controlPointG = PlaitBoard.getRoughSVG(this.board).circle(p[0], p[1], 16, {
                stroke: '#f08c02',
                fill: '#f08c02',
                fillStyle: 'solid'
            });
            this.xxxxx.push(controlPointG);
            PlaitBoard.getElementActiveHost(this.board).append(controlPointG);
        });
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
        const isBoundedSourceElementsChanged = boundedElements.source !== this.boundedElements.source;
        const isBoundedTargetElementsChanged = boundedElements.target !== this.boundedElements.target;
        const isBoundedElementsChanged = isBoundedSourceElementsChanged || isBoundedTargetElementsChanged;
        this.boundedElements = boundedElements;
        const isChangeTheme = this.board.operations.find(op => op.type === 'set_theme');
        if (value.element !== previous.element || isChangeTheme) {
            this.shapeGenerator.processDrawing(this.element, this.g);
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
            this.updateText(previous.element.texts, value.element.texts);
            this.updateTextRectangle();
            this.xxxxx.forEach(g => g.remove());
            this.xxxxx = [];
            const points = this.element.points;
            points.forEach((p, index) => {
                if (index === 0) {
                    return;
                }
                if (index === points.length - 1) {
                    return;
                }
                const controlPointG = PlaitBoard.getRoughSVG(this.board).circle(p[0], p[1], 8, {
                    stroke: '#f08c02',
                    fill: '#f08c02',
                    fillStyle: 'solid'
                });
                this.xxxxx.push(controlPointG);
                // PlaitBoard.getElementActiveHost(this.board).append(controlPointG);
            });
        } else {
            const hasSameSelected = value.selected === previous.selected;
            if (!hasSameSelected || (value.selected && isSelectionMoving(this.board))) {
                this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
            }
        }
        if (isBoundedElementsChanged) {
            const isSetNode = this.board.operations.find(op => op.type === 'set_node') as SetNodeOperation;
            if (this.element.points.length !== 2 && isSetNode) {
                let index = 1;
                let nextIndex = 2;
                if (isBoundedTargetElementsChanged) {
                    index = this.element.points.length - 2;
                    nextIndex = this.element.points.length - 3;
                }
                const oldPoints = isSetNode.properties.points;
                const newPoints = isSetNode.newProperties.points;
                const updatePoint = this.element.points[index];
                const nextPoint = this.element.points[nextIndex];
                let newPoint: Point = updatePoint;
                if (oldPoints?.length && newPoints?.length) {
                    if (isHorizontalSegment([updatePoint, nextPoint])) {
                        const offset = newPoints[0][0] - oldPoints[0][0];
                        newPoint = [updatePoint[0] + offset, updatePoint[1]];
                    }
                    if (isVerticalSegment([updatePoint, nextPoint])) {
                        const offset = newPoints[0][1] - oldPoints[0][1];
                        newPoint = [updatePoint[0], updatePoint[1] + offset];
                    }
                    const path = PlaitBoard.findPath(this.board, this.element);
                    const points = [...this.element.points];
                    points.splice(index, 1, newPoint);
                    // DrawTransforms.resizeLine(this.board, { points }, path);
                }
            }
            this.shapeGenerator.processDrawing(this.element, this.g);
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
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
