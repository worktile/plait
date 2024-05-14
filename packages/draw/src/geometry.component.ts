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
import { PlaitCommonGeometry, PlaitGeometry } from './interfaces/geometry';
import { GeometryShapeGenerator } from './generators/geometry-shape.generator';
import { TextManageRef } from '@plait/text';
import { DrawTransforms } from './transforms';
import { ActiveGenerator, CommonPluginElement, canResize } from '@plait/common';
import { LineAutoCompleteGenerator } from './generators/line-auto-complete.generator';
import { isMultipleTextGeometry, memorizeLatestText } from './utils';
import { TextGenerator } from './generators/text.generator';
import { SingleTextGenerator } from './generators/single-text.generator';

@Component({
    selector: 'plait-draw-geometry',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class GeometryComponent<T extends PlaitCommonGeometry = PlaitGeometry> extends CommonPluginElement<T, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<T, PlaitBoard> {
    destroy$ = new Subject<void>();

    activeGenerator!: ActiveGenerator<T>;

    lineAutoCompleteGenerator!: LineAutoCompleteGenerator;

    shapeGenerator!: GeometryShapeGenerator;

    textGenerator!: TextGenerator<T>;

    constructor() {
        super();
    }

    initializeGenerator() {
        this.activeGenerator = new ActiveGenerator<T>(this.board, {
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
            getRectangle: (element: T) => {
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
        this.shapeGenerator.processDrawing((this.element as unknown) as PlaitGeometry, this.getElementG());
        this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
            selected: this.selected
        });
        this.lineAutoCompleteGenerator.processDrawing(
            (this.element as unknown) as PlaitGeometry,
            PlaitBoard.getElementActiveHost(this.board),
            {
                selected: this.selected
            }
        );
        this.textGenerator.draw(this.getElementG());
    }

    onContextChanged(value: PlaitPluginElementContext<T, PlaitBoard>, previous: PlaitPluginElementContext<T, PlaitBoard>) {
        this.initializeWeakMap();
        const isChangeTheme = this.board.operations.find(op => op.type === 'set_theme');
        if (value.element !== previous.element || isChangeTheme) {
            this.shapeGenerator.processDrawing((this.element as unknown) as PlaitGeometry, this.getElementG());
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
            this.lineAutoCompleteGenerator.processDrawing(
                (this.element as unknown) as PlaitGeometry,
                PlaitBoard.getElementActiveHost(this.board),
                {
                    selected: this.selected
                }
            );
            this.updateText(previous.element, value.element);
        } else {
            const hasSameSelected = value.selected === previous.selected;
            const hasSameHandleState = this.activeGenerator.options.hasResizeHandle() === this.activeGenerator.hasResizeHandle;
            if (!hasSameSelected || !hasSameHandleState) {
                this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), { selected: this.selected });
                this.lineAutoCompleteGenerator.processDrawing(
                    (this.element as unknown) as PlaitGeometry,
                    PlaitBoard.getElementActiveHost(this.board),
                    {
                        selected: this.selected
                    }
                );
            }
        }
    }

    updateText(previousElement: T, currentElement: T) {
        if (isMultipleTextGeometry(this.element)) {
            this.textGenerator.update(this.element, previousElement.texts, currentElement.texts, this.getElementG());
        } else {
            this.textGenerator.update(this.element, previousElement.text, currentElement.text, this.getElementG());
        }
    }

    initializeTextManage() {
        const TextGeneratorClass = isMultipleTextGeometry(this.element) ? TextGenerator : SingleTextGenerator;

        this.textGenerator = new TextGeneratorClass(
            this.board,
            this.element,
            isMultipleTextGeometry(this.element) ? this.element.texts! : this.element.text,
            this.viewContainerRef,
            {
                onValueChangeHandle: (textManageRef: TextManageRef) => {
                    const height = textManageRef.height / this.board.viewport.zoom;
                    const width = textManageRef.width / this.board.viewport.zoom;
                    if (textManageRef.newValue) {
                        DrawTransforms.setText(
                            this.board,
                            (this.element as unknown) as PlaitGeometry,
                            textManageRef.newValue,
                            width,
                            height
                        );
                    } else {
                        DrawTransforms.setTextSize(this.board, (this.element as unknown) as PlaitGeometry, width, height);
                    }
                    textManageRef.operations && memorizeLatestText((this.element as unknown) as PlaitGeometry, textManageRef.operations);
                }
            }
        );

        this.textGenerator.initialize();
        this.initializeTextManages(this.textGenerator.textManages);
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy$.next();
        this.destroy$.complete();
        this.activeGenerator.destroy();
        this.lineAutoCompleteGenerator.destroy();
        this.textGenerator.destroy();
        this.destroyTextManages();
    }
}
