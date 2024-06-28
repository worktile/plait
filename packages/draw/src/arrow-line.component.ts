import { PlaitBoard, PlaitPluginElementContext, OnContextChanged, getElementById, createDebugGenerator, PlaitNode } from '@plait/core';
import { ArrowLineText, PlaitArrowLine, PlaitDrawElement, PlaitGeometry } from './interfaces';
import { ArrowLineShapeGenerator } from './generators/arrow-line.generator';
import { ArrowLineActiveGenerator } from './generators/arrow-line-active.generator';
import { DrawTransforms } from './transforms';
import { GeometryThreshold, MIN_TEXT_WIDTH } from './constants';
import { CommonElementFlavour, TextManage, TextManageChangeData } from '@plait/common';
import { getArrowLinePoints, getArrowLineTextRectangle } from './utils/arrow-line/arrow-line-basic';
import { memorizeLatestText } from './utils/memorize';

interface BoundedElements {
    source?: PlaitGeometry;
    target?: PlaitGeometry;
}

const debugKey = 'debug:plait:line-turning';
const debugGenerator = createDebugGenerator(debugKey);

export class ArrowLineComponent extends CommonElementFlavour<PlaitArrowLine, PlaitBoard>
    implements OnContextChanged<PlaitArrowLine, PlaitBoard> {
    shapeGenerator!: ArrowLineShapeGenerator;

    activeGenerator!: ArrowLineActiveGenerator;

    boundedElements: BoundedElements = {};

    constructor() {
        super();
    }

    initializeGenerator() {
        this.shapeGenerator = new ArrowLineShapeGenerator(this.board);
        this.activeGenerator = new ArrowLineActiveGenerator(this.board);
        this.initializeTextManagesByElement();
    }

    initialize(): void {
        this.initializeGenerator();
        this.shapeGenerator.processDrawing(this.element, this.getElementG());
        const linePoints = getArrowLinePoints(this.board, this.element);
        this.activeGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
            selected: this.selected,
            linePoints
        });
        super.initialize();
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

    onContextChanged(
        value: PlaitPluginElementContext<PlaitArrowLine, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitArrowLine, PlaitBoard>
    ) {
        this.initializeWeakMap();
        const boundedElements = this.getBoundedElements();
        const isBoundedElementsChanged =
            boundedElements.source !== this.boundedElements.source || boundedElements.target !== this.boundedElements.target;
        this.boundedElements = boundedElements;
        const isChangeTheme = this.board.operations.find(op => op.type === 'set_theme');
        const linePoints = getArrowLinePoints(this.board, this.element);
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
            this.element.texts.forEach((text: ArrowLineText, index: number) => {
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

    createTextManage(text: ArrowLineText, index: number) {
        return new TextManage(this.board, {
            getRectangle: () => {
                return getArrowLineTextRectangle(this.board, this.element as PlaitArrowLine, index);
            },
            onChange: (textManageChangeData: TextManageChangeData) => {
                const path = PlaitBoard.findPath(this.board, this.element);
                const node = PlaitNode.get(this.board, path) as PlaitArrowLine;
                const texts = [...node.texts];
                const newWidth = textManageChangeData.width < MIN_TEXT_WIDTH ? MIN_TEXT_WIDTH : textManageChangeData.width;
                texts.splice(index, 1, {
                    text: textManageChangeData.newText ? textManageChangeData.newText : this.element.texts[index].text,
                    position: this.element.texts[index].position,
                    width: newWidth,
                    height: textManageChangeData.height
                });
                DrawTransforms.setArrowLineTexts(this.board, this.element as PlaitArrowLine, texts);
                textManageChangeData.operations && memorizeLatestText(this.element, textManageChangeData.operations);
            },
            getMaxWidth: () => GeometryThreshold.defaultTextMaxWidth,
            textPlugins: []
        });
    }

    updateText(previousTexts: ArrowLineText[], currentTexts: ArrowLineText[]) {
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

    destroy(): void {
        super.destroy();
        this.activeGenerator.destroy();
        this.destroyTextManages();
    }
}
