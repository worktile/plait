import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
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
import { PlaitCommonGeometry, PlaitGeometry, PlaitGeometryText } from './interfaces/geometry';
import { GeometryShapeGenerator } from './generators/geometry-shape.generator';
import { ParagraphElement, TextManage, TextManageRef } from '@plait/text';
import { DrawTransforms } from './transforms';
import { getTextRectangle } from './utils/geometry';
import { ActiveGenerator, WithTextPluginKey, WithTextOptions, CommonPluginElement, canResize } from '@plait/common';
import { GeometryThreshold } from './constants/geometry';
import { PlaitText } from './interfaces';
import { getEngine } from './engines';
import { LineAutoCompleteGenerator } from './generators/line-auto-complete.generator';
import { isMultipleTextGeometry, memorizeLatestText } from './utils';

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
        this.drawText();
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
            this.updateText(value.element);
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

    drawText() {
        const centerPoint = RectangleClient.getCenterPoint(this.board.getRectangle(this.element)!);
        if (this.element.text || this.element.texts?.length) {
            const textElements = this.getElementTextElements(this.element);
            this.getTextManages().forEach((manage, index) => {
                manage.draw(textElements[index]);
                this.getElementG().append(manage.g);
                manage.updateAngle(centerPoint, this.element.angle);
            });
        }
    }

    updateText(currentElement: T) {
        const currentTextElements = this.getElementTextElements(currentElement);
        const centerPoint = RectangleClient.getCenterPoint(this.board.getRectangle(this.element)!);
        this.getTextManages().forEach((manage, index) => {
            manage.updateText(currentTextElements[index]);
            manage.updateRectangle();
            manage.updateAngle(centerPoint, this.element.angle);
        });
    }

    initializeTextManage() {
        if (this.element.texts?.length) {
            let manages: TextManage[] = [];
            const texts = this.element.texts;
            for (let i = 0; i < texts.length; i++) {
                let manage = this.createTextManage({ key: texts[i].key });
                manages.push(manage);
            }
            this.initializeTextManages(manages);
            return;
        }

        if (this.element.text) {
            const manage = this.createTextManage();
            this.initializeTextManages([manage]);
        }
    }

    createTextManage(options?: { [key: string]: any }) {
        const plugins = ((this.board as PlaitOptionsBoard).getPluginOptions<WithTextOptions>(WithTextPluginKey) || {}).textPlugins;
        return new TextManage(this.board, this.viewContainerRef, {
            getRectangle: () => {
                const getRectangle = getEngine(this.element.shape).getTextRectangle;
                if (getRectangle) {
                    return getRectangle((this.element as unknown) as PlaitGeometry, options);
                }
                return getTextRectangle((this.element as unknown) as PlaitGeometry);
            },
            onValueChangeHandle: (textManageRef: TextManageRef) => {
                const height = textManageRef.height / this.board.viewport.zoom;
                const width = textManageRef.width / this.board.viewport.zoom;
                if (textManageRef.newValue) {
                    DrawTransforms.setText(this.board, (this.element as unknown) as PlaitGeometry, textManageRef.newValue, width, height);
                } else {
                    DrawTransforms.setTextSize(this.board, (this.element as unknown) as PlaitGeometry, width, height);
                }
                textManageRef.operations && memorizeLatestText((this.element as unknown) as PlaitGeometry, textManageRef.operations);
            },
            getMaxWidth: () => {
                let width = getTextRectangle((this.element as unknown) as PlaitGeometry).width;
                const getRectangle = getEngine(this.element.shape).getTextRectangle;
                if (getRectangle) {
                    width = getRectangle((this.element as unknown) as PlaitGeometry).width;
                }
                return ((this.element as unknown) as PlaitText)?.autoSize ? GeometryThreshold.defaultTextMaxWidth : width;
            },
            textPlugins: plugins
        });
    }

    getElementTextElements(element: T): ParagraphElement[] {
        return isMultipleTextGeometry(element) ? (element.texts || []).map((item: PlaitGeometryText) => item && item.text) : [element.text];
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy$.next();
        this.destroy$.complete();
        this.activeGenerator.destroy();
        this.lineAutoCompleteGenerator.destroy();
        this.destroyTextManages();
    }
}
