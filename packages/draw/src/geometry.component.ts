import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import {
    PlaitBoard,
    PlaitPluginElementContext,
    OnContextChanged,
    isSelectionMoving,
    getSelectedElements,
    ACTIVE_STROKE_WIDTH,
    RectangleClient
} from '@plait/core';
import { Subject } from 'rxjs';
import { PlaitCommonGeometry, PlaitGeometry, PlaitMultipleTextGeometry } from './interfaces/geometry';
import { GeometryShapeGenerator } from './generators/geometry-shape.generator';
import { TextManageRef } from '@plait/text';
import { DrawTransforms } from './transforms';
import { ActiveGenerator, CommonPluginElement, canResize } from '@plait/common';
import { LineAutoCompleteGenerator } from './generators/line-auto-complete.generator';
import { getTextRectangle, isMultipleTextGeometry, memorizeLatestText } from './utils';
import { PlaitDrawShapeText, TextGenerator } from './generators/text.generator';
import { SingleTextGenerator } from './generators/single-text.generator';
import { PlaitText } from './interfaces';
import { GeometryThreshold } from './constants';
import { getEngine } from './engines';

@Component({
    selector: 'plait-draw-geometry',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class GeometryComponent extends CommonPluginElement<PlaitCommonGeometry, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitCommonGeometry, PlaitBoard> {
    destroy$ = new Subject<void>();

    activeGenerator!: ActiveGenerator<PlaitCommonGeometry>;

    lineAutoCompleteGenerator!: LineAutoCompleteGenerator;

    shapeGenerator!: GeometryShapeGenerator;

    textGenerator!: TextGenerator<PlaitMultipleTextGeometry> | SingleTextGenerator;

    constructor() {
        super();
    }

    initializeGenerator() {
        this.activeGenerator = new ActiveGenerator<PlaitCommonGeometry>(this.board, {
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
            getRectangle: (element: PlaitCommonGeometry) => {
                return RectangleClient.getRectangleByPoints(element.points);
            },
            hasResizeHandle: () => {
                return canResize(this.board, this.element);
            }
        });
        this.lineAutoCompleteGenerator = new LineAutoCompleteGenerator(this.board);
        this.shapeGenerator = new GeometryShapeGenerator(this.board);
        this.initializeTextManage();
        this.getRef().addGenerator(LineAutoCompleteGenerator.key, this.lineAutoCompleteGenerator);
        this.getRef().addGenerator(ActiveGenerator.key, this.activeGenerator);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
        this.shapeGenerator.processDrawing(this.element as PlaitGeometry, this.getElementG());
        this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
            selected: this.selected
        });
        this.lineAutoCompleteGenerator.processDrawing(this.element as PlaitGeometry, PlaitBoard.getElementActiveHost(this.board), {
            selected: this.selected
        });
        this.textGenerator.draw(this.getElementG());
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitCommonGeometry, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitCommonGeometry, PlaitBoard>
    ) {
        const isChangeTheme = this.board.operations.find(op => op.type === 'set_theme');
        if (value.element !== previous.element || isChangeTheme) {
            this.shapeGenerator.processDrawing(this.element as PlaitGeometry, this.getElementG());
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
            this.lineAutoCompleteGenerator.processDrawing(this.element as PlaitGeometry, PlaitBoard.getElementActiveHost(this.board), {
                selected: this.selected
            });
            this.updateText(previous.element, value.element);
        } else {
            const hasSameSelected = value.selected === previous.selected;
            const hasSameHandleState = this.activeGenerator.options.hasResizeHandle() === this.activeGenerator.hasResizeHandle;
            if (!hasSameSelected || !hasSameHandleState) {
                this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
                this.lineAutoCompleteGenerator.processDrawing(this.element as PlaitGeometry, PlaitBoard.getElementActiveHost(this.board), {
                    selected: this.selected
                });
            }
        }
    }

    updateText(previousElement: PlaitCommonGeometry, currentElement: PlaitCommonGeometry) {
        if (isMultipleTextGeometry(this.element)) {
            (this.textGenerator as TextGenerator<PlaitMultipleTextGeometry>).update(
                this.element,
                previousElement.texts,
                currentElement.texts,
                this.getElementG()
            );
        } else {
            (this.textGenerator as SingleTextGenerator).update(
                this.element as PlaitGeometry,
                previousElement.text,
                currentElement.text,
                this.getElementG()
            );
        }
    }

    initializeTextManage() {
        const onTextValueChangeHandle = (textManageRef: TextManageRef, text: PlaitDrawShapeText) => {
            const height = textManageRef.height / this.board.viewport.zoom;
            const width = textManageRef.width / this.board.viewport.zoom;
            if (textManageRef.newValue) {
                if (isMultipleTextGeometry(this.element)) {
                    DrawTransforms.setDrawShapeText(this.board, this.element, {
                        key: text.key,
                        text: textManageRef.newValue,
                        textHeight: height
                    });
                } else {
                    DrawTransforms.setText(this.board, this.element as PlaitGeometry, textManageRef.newValue, width, height);
                }
            } else {
                DrawTransforms.setTextSize(this.board, this.element as PlaitGeometry, width, height);
            }
            textManageRef.operations && memorizeLatestText(this.element, textManageRef.operations);
        };

        if (isMultipleTextGeometry(this.element)) {
            this.textGenerator = new TextGenerator<PlaitMultipleTextGeometry>(
                this.board,
                this.element as PlaitMultipleTextGeometry,
                this.element.texts!,
                this.viewContainerRef,
                {
                    onValueChangeHandle: onTextValueChangeHandle
                }
            );
        } else {
            this.textGenerator = new SingleTextGenerator(
                this.board,
                this.element as PlaitGeometry,
                this.element.text,
                this.viewContainerRef,
                {
                    onValueChangeHandle: onTextValueChangeHandle,
                    getMaxWidth: () => {
                        let width = getTextRectangle(this.element).width;
                        const getRectangle = getEngine(this.element.shape).getTextRectangle;
                        if (getRectangle) {
                            width = getRectangle(this.element as PlaitGeometry).width;
                        }
                        return (this.element as PlaitText)?.autoSize ? GeometryThreshold.defaultTextMaxWidth : width;
                    }
                }
            );
        }
        this.textGenerator.initialize();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy$.next();
        this.destroy$.complete();
        this.activeGenerator.destroy();
        this.lineAutoCompleteGenerator.destroy();
        this.textGenerator.destroy();
    }
}
