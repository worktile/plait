import {
    PlaitBoard,
    PlaitPluginElementContext,
    OnContextChanged,
    isSelectionMoving,
    getSelectedElements,
    ACTIVE_STROKE_WIDTH,
    RectangleClient
} from '@plait/core';
import { PlaitCommonGeometry, PlaitGeometry, PlaitMultipleTextGeometry } from './interfaces/geometry';
import { GeometryShapeGenerator } from './generators/geometry-shape.generator';
import { DrawTransforms } from './transforms';
import { ActiveGenerator, CommonElementFlavour, TextManageChangeData, createActiveGenerator, hasResizeHandle } from '@plait/common';
import { ArrowLineAutoCompleteGenerator } from './generators/arrow-line-auto-complete.generator';
import { getTextRectangle, isGeometryIncludeText, isMultipleTextGeometry, memorizeLatestText } from './utils';
import { DrawTextInfo, TextGenerator } from './generators/text.generator';
import { SingleTextGenerator } from './generators/single-text.generator';
import { PlaitText } from './interfaces';
import { GeometryThreshold } from './constants';
import { getEngine } from './engines';

export class GeometryComponent
    extends CommonElementFlavour<PlaitCommonGeometry, PlaitBoard>
    implements OnContextChanged<PlaitCommonGeometry, PlaitBoard>
{
    activeGenerator!: ActiveGenerator<PlaitCommonGeometry>;

    lineAutoCompleteGenerator!: ArrowLineAutoCompleteGenerator;

    shapeGenerator!: GeometryShapeGenerator;

    textGenerator!: TextGenerator<PlaitMultipleTextGeometry> | SingleTextGenerator;

    constructor() {
        super();
    }

    initializeGenerator() {
        this.activeGenerator = createActiveGenerator(this.board, {
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
                return hasResizeHandle(this.board, this.element);
            }
        });
        this.lineAutoCompleteGenerator = new ArrowLineAutoCompleteGenerator(this.board);
        this.shapeGenerator = new GeometryShapeGenerator(this.board);
        if (isGeometryIncludeText(this.element)) {
            this.initializeTextManage();
        }
        this.getRef().addGenerator(ArrowLineAutoCompleteGenerator.key, this.lineAutoCompleteGenerator);
        this.getRef().addGenerator(ActiveGenerator.key, this.activeGenerator);
        this.getRef().updateActiveSection = () => {
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getActiveHost(this.board), {
                selected: this.selected
            });
            this.lineAutoCompleteGenerator.processDrawing(this.element as PlaitGeometry, PlaitBoard.getActiveHost(this.board), {
                selected: this.selected
            });
        }
    }

    initialize(): void {
        super.initialize();
        this.initializeGenerator();
        this.shapeGenerator.processDrawing(this.element as PlaitGeometry, this.getElementG());
        this.activeGenerator.processDrawing(this.element, PlaitBoard.getActiveHost(this.board), {
            selected: this.selected
        });
        this.lineAutoCompleteGenerator.processDrawing(this.element as PlaitGeometry, PlaitBoard.getElementTopHost(this.board), {
            selected: this.selected
        });
        this.textGenerator && this.textGenerator.draw(this.getElementG());
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitCommonGeometry, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitCommonGeometry, PlaitBoard>
    ) {
        if (value.element !== previous.element || value.hasThemeChanged) {
            this.shapeGenerator.processDrawing(this.element as PlaitGeometry, this.getElementG());
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getActiveHost(this.board), { selected: this.selected });
            this.lineAutoCompleteGenerator.processDrawing(this.element as PlaitGeometry, PlaitBoard.getActiveHost(this.board), {
                selected: this.selected
            });
            this.textGenerator && this.updateText(previous.element, value.element);
        } else {
            const hasSameSelected = value.selected === previous.selected;
            const hasSameHandleState = this.activeGenerator.options.hasResizeHandle() === this.activeGenerator.hasResizeHandle;
            if (!hasSameSelected || !hasSameHandleState || value.selected) {
                this.activeGenerator.processDrawing(this.element, PlaitBoard.getActiveHost(this.board), {
                    selected: this.selected
                });
                this.lineAutoCompleteGenerator.processDrawing(this.element as PlaitGeometry, PlaitBoard.getActiveHost(this.board), {
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
        const onTextChange = (element: PlaitCommonGeometry, textManageChangeData: TextManageChangeData, text: DrawTextInfo) => {
            if (textManageChangeData.newText) {
                if (isMultipleTextGeometry(element)) {
                    DrawTransforms.setDrawTexts(this.board, element, {
                        id: text.id,
                        text: textManageChangeData.newText,
                        textHeight: textManageChangeData.height
                    });
                } else {
                    DrawTransforms.setText(
                        this.board,
                        element as PlaitGeometry,
                        textManageChangeData.newText,
                        textManageChangeData.width,
                        textManageChangeData.height
                    );
                }
            } else {
                DrawTransforms.setTextSize(this.board, element as PlaitGeometry, textManageChangeData.width, textManageChangeData.height);
            }
            textManageChangeData.operations && memorizeLatestText(element, textManageChangeData.operations);
        };

        if (isMultipleTextGeometry(this.element)) {
            this.textGenerator = new TextGenerator<PlaitMultipleTextGeometry>(
                this.board,
                this.element as PlaitMultipleTextGeometry,
                this.element.texts!,
                {
                    onChange: onTextChange
                }
            );
        } else {
            this.textGenerator = new SingleTextGenerator(this.board, this.element as PlaitGeometry, this.element.text, {
                onChange: onTextChange,
                getMaxWidth: () => {
                    let width = getTextRectangle(this.element).width;
                    const getRectangle = getEngine(this.element.shape).getTextRectangle;
                    if (getRectangle) {
                        width = getRectangle(this.element as PlaitGeometry).width;
                    }
                    return (this.element as PlaitText)?.autoSize ? GeometryThreshold.defaultTextMaxWidth : width;
                }
            });
        }
        this.textGenerator.initialize();
    }

    destroy(): void {
        super.destroy();
        this.activeGenerator.destroy();
        this.lineAutoCompleteGenerator.destroy();
        this.textGenerator?.destroy();
    }
}
