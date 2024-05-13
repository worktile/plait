import { ELEMENT_TO_TEXT_MANAGES, WithTextOptions, WithTextPluginKey } from '@plait/common';
import { createG, PlaitBoard, PlaitElement, PlaitOptionsBoard, RectangleClient } from '@plait/core';
import { TextPlugin, TextManageRef, TextManage, ParagraphElement } from '@plait/text';
import { getEngine } from '../engines';
import { DrawShapes, EngineExtraData, PlaitGeometry } from '../interfaces';
import { getTextRectangle, memorizeLatestText } from '../utils';
import { ViewContainerRef } from '@angular/core';
import { DrawTransforms } from '../transforms';

export interface PlaitDrawShapeText extends EngineExtraData {
    key: string;
    text: ParagraphElement;
    textHeight: number;
}

export interface TextGeneratorOptions {
    onValueChangeHandle?: (textChangeRef: TextManageRef, text: PlaitDrawShapeText) => void;
    getMaxWidth?: (text: PlaitDrawShapeText) => number;
}

export class TextGenerator<T extends PlaitElement = PlaitGeometry> {
    protected board: PlaitBoard;

    protected element: T;

    protected texts: PlaitDrawShapeText[];

    protected viewContainerRef: ViewContainerRef;

    protected options: TextGeneratorOptions | undefined;

    public textManages!: TextManage[];

    get shape(): DrawShapes {
        return this.element.shape || this.element.type;
    }

    constructor(
        board: PlaitBoard,
        element: T,
        texts: PlaitDrawShapeText[],
        viewContainerRef: ViewContainerRef,
        options?: TextGeneratorOptions
    ) {
        this.board = board;
        this.texts = texts;
        this.element = element;
        this.viewContainerRef = viewContainerRef;
        this.options = options;
    }

    initialize() {
        const textPlugins = ((this.board as PlaitOptionsBoard).getPluginOptions<WithTextOptions>(WithTextPluginKey) || {}).textPlugins;
        this.textManages = this.texts.map(text => {
            return this.createTextManage(text, textPlugins);
        });
    }

    draw(elementG: SVGElement) {
        const centerPoint = RectangleClient.getCenterPoint(this.board.getRectangle(this.element)!);
        this.texts.forEach((drawShapeText, index) => {
            const textManage = this.textManages[index];
            if (drawShapeText.text) {
                textManage.draw(drawShapeText.text);
                elementG.append(textManage.g);
                this.element.angle ?? textManage.updateAngle(centerPoint, this.element.angle);
            }
        });
    }

    update(element: T, previousDrawShapeTexts: PlaitDrawShapeText[], currentDrawShapeTexts: PlaitDrawShapeText[], elementG: SVGElement) {
        this.element = element;
        previousDrawShapeTexts.forEach((drawShapeText, index) => {
            if (!currentDrawShapeTexts.some(item => item.key === drawShapeText.key)) {
                const textManage = this.textManages[index];
                textManage.destroy();
            }
        });
        const centerPoint = RectangleClient.getCenterPoint(this.board.getRectangle(this.element)!);
        const textPlugins = ((this.board as PlaitOptionsBoard).getPluginOptions<WithTextOptions>(WithTextPluginKey) || {}).textPlugins;
        currentDrawShapeTexts.forEach((drawShapeText, index) => {
            if (!previousDrawShapeTexts.some(item => item.key === drawShapeText.key)) {
                const textManage = this.createTextManage(drawShapeText, textPlugins);
                this.textManages.push(textManage);
                elementG.append(textManage.g);
            }
            const textManage = this.textManages[index];
            if (drawShapeText.text) {
                textManage.updateText(drawShapeText.text);
                textManage.updateRectangle();
                this.element.angle ?? textManage.updateAngle(centerPoint, this.element.angle);
            }
        });
    }

    private createTextManage(text: PlaitDrawShapeText, textPlugins: TextPlugin[] | undefined) {
        const textManage = new TextManage(this.board, this.viewContainerRef, {
            getRectangle: () => {
                return this.getRectangle(text);
            },
            onValueChangeHandle: (textManageRef: TextManageRef) => {
                return this.onValueChangeHandle(textManageRef, text);
            },
            getMaxWidth: () => {
                return this.getMaxWidth(text);
            },
            textPlugins
        });
        return textManage;
    }

    getRectangle(text: PlaitDrawShapeText) {
        const getRectangle = getEngine<T>(this.shape).getTextRectangle;
        if (getRectangle) {
            return getRectangle(this.element, text);
        }
        return getTextRectangle(this.element);
    }

    onValueChangeHandle(textManageRef: TextManageRef, text: PlaitDrawShapeText) {
        if (this.options?.onValueChangeHandle) {
            return this.options?.onValueChangeHandle(textManageRef, text);
        }
        const height = textManageRef.height / this.board.viewport.zoom;
        const width = textManageRef.width / this.board.viewport.zoom;
        if (textManageRef.newValue) {
            DrawTransforms.setText(this.board, (this.element as unknown) as PlaitGeometry, textManageRef.newValue, width, height);
        } else {
            DrawTransforms.setTextSize(this.board, (this.element as unknown) as PlaitGeometry, width, height);
        }
        textManageRef.operations && memorizeLatestText((this.element as unknown) as PlaitGeometry, textManageRef.operations);
    }

    getMaxWidth(text: PlaitDrawShapeText) {
        if (this.options?.getMaxWidth) {
            return this.options?.getMaxWidth(text);
        }
        let width = getTextRectangle(this.element).width;
        const getRectangle = getEngine<T>(this.shape).getTextRectangle;
        if (getRectangle) {
            width = getRectangle(this.element, text).width;
        }
        return width;
    }

    destroy() {
        this.textManages.forEach(manage => {
            manage.destroy();
        });
        this.textManages = [];
        ELEMENT_TO_TEXT_MANAGES.delete(this.element);
    }
}
