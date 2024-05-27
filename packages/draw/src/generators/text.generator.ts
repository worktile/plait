import { ELEMENT_TO_TEXT_MANAGES, WithTextOptions, WithTextPluginKey } from '@plait/common';
import { PlaitBoard, PlaitElement, PlaitOptionsBoard, RectangleClient } from '@plait/core';
import { TextPlugin, TextManageRef, TextManage, ParagraphElement } from '@plait/text';
import { getEngine } from '../engines';
import { DrawShapes, EngineExtraData, PlaitGeometry } from '../interfaces';
import { getTextKey, getTextRectangle } from '../utils';
import { ViewContainerRef } from '@angular/core';

export interface PlaitDrawShapeText extends EngineExtraData {
    key: string;
    text: ParagraphElement;
    textHeight: number;
    board?: PlaitBoard;
}

export interface TextGeneratorOptions<T> {
    onValueChangeHandle: (element: T, textChangeRef: TextManageRef, text: PlaitDrawShapeText) => void;
    getRenderRectangle?: (element: T, text: PlaitDrawShapeText) => RectangleClient;
    getMaxWidth?: () => number;
}

export const KEY_TO_TEXT_MANAGE: Map<string, TextManage> = new Map();

export const setTextManage = (key: string, textManage: TextManage) => {
    return KEY_TO_TEXT_MANAGE.set(key, textManage);
};

export const getTextManage = (key: string) => {
    return KEY_TO_TEXT_MANAGE.get(key);
};

export const deleteTextManage = (key: string) => {
    return KEY_TO_TEXT_MANAGE.delete(key);
};

export class TextGenerator<T extends PlaitElement = PlaitGeometry> {
    protected board: PlaitBoard;

    protected element: T;

    protected texts: PlaitDrawShapeText[];

    protected viewContainerRef: ViewContainerRef;

    protected options: TextGeneratorOptions<T>;

    public textManages!: TextManage[];

    get shape(): DrawShapes {
        return this.element.shape || this.element.type;
    }

    constructor(
        board: PlaitBoard,
        element: T,
        texts: PlaitDrawShapeText[],
        viewContainerRef: ViewContainerRef,
        options: TextGeneratorOptions<T>
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
            const textManage = this.createTextManage(text, textPlugins);
            setTextManage(getTextKey(this.element, text), textManage);
            return textManage;
        });
        ELEMENT_TO_TEXT_MANAGES.set(this.element, this.textManages);
    }

    draw(elementG: SVGElement) {
        const centerPoint = RectangleClient.getCenterPoint(this.board.getRectangle(this.element)!);
        this.texts.forEach(drawShapeText => {
            const textManage = getTextManage(getTextKey(this.element, drawShapeText));
            if (drawShapeText.text && textManage) {
                textManage.draw(drawShapeText.text);
                elementG.append(textManage.g);
                (this.element.angle || this.element.angle === 0) && textManage.updateAngle(centerPoint, this.element.angle);
            }
        });
    }

    update(element: T, previousDrawShapeTexts: PlaitDrawShapeText[], currentDrawShapeTexts: PlaitDrawShapeText[], elementG: SVGElement) {
        this.element = element;
        ELEMENT_TO_TEXT_MANAGES.set(this.element, this.textManages);
        const centerPoint = RectangleClient.getCenterPoint(this.board.getRectangle(this.element)!);
        const textPlugins = ((this.board as PlaitOptionsBoard).getPluginOptions<WithTextOptions>(WithTextPluginKey) || {}).textPlugins;
        const removedTexts = previousDrawShapeTexts.filter(value => {
            return !currentDrawShapeTexts.find(item => item.key === value.key);
        });
        if (removedTexts.length) {
            removedTexts.forEach(item => {
                const textManage = getTextManage(item.key);
                const index = this.textManages.findIndex(value => value === textManage);
                if (index > -1 && item.text && item.textHeight) {
                    this.textManages.splice(index, 1);
                }
                textManage?.destroy();
                deleteTextManage(item.key);
            });
        }
        currentDrawShapeTexts.forEach(drawShapeText => {
            if (drawShapeText.text) {
                let textManage = getTextManage(getTextKey(this.element, drawShapeText));
                if (!textManage) {
                    textManage = this.createTextManage(drawShapeText, textPlugins);
                    setTextManage(drawShapeText.key, textManage);
                    textManage.draw(drawShapeText.text);
                    elementG.append(textManage.g);
                    this.textManages.push(textManage);
                } else {
                    textManage.updateText(drawShapeText.text);
                    textManage.updateRectangle();
                }
                (this.element.angle || this.element.angle === 0) && textManage.updateAngle(centerPoint, this.element.angle);
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
            getRenderRectangle: () => {
                return this.options.getRenderRectangle ? this.options.getRenderRectangle(this.element, text) : this.getRectangle(text);
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
        return this.options.onValueChangeHandle(this.element, textManageRef, text);
    }

    getMaxWidth(text: PlaitDrawShapeText) {
        return this.options.getMaxWidth ? this.options.getMaxWidth() : this.getRectangle(text).width;
    }

    destroy() {
        this.textManages.forEach(manage => {
            manage.destroy();
        });
        this.textManages = [];
        ELEMENT_TO_TEXT_MANAGES.delete(this.element);
        this.texts.forEach(item => {
            deleteTextManage(item.key);
        });
    }
}
