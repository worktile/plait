import {
    ParagraphElement,
    PlaitCommonElementRef,
    TextManage,
    TextManageChangeData,
    TextPlugin,
    WithTextPluginKey,
    WithTextPluginOptions
} from '@plait/common';
import { PlaitBoard, PlaitElement, PlaitOptionsBoard, RectangleClient } from '@plait/core';
import { getEngine } from '../engines';
import { DrawShapes, PlaitGeometry, TextRectangleOptions } from '../interfaces';
import { getTextKey, getTextRectangle } from '../utils';

export interface DrawTextInfo extends TextRectangleOptions {
    text: ParagraphElement;
}

export interface TextGeneratorOptions<T> {
    onChange: (element: T, textChangeRef: TextManageChangeData, text: DrawTextInfo) => void;
    getRenderRectangle?: (element: T, text: DrawTextInfo) => RectangleClient;
    getMaxWidth?: () => number;
}

// TODO: 是否可以完全基于位置定位 TextManager，实现 line 和 多文本 geometry 统一
// 一个元素有多个文本时，单纯通过位置无法获取 TextManage，因此这里单独通过 Map 保存关键字 key 和 TextManage 的对应关系
// 1. 单文本元素 key 就是元素的 id
// 2. 表格元素 key 是单元格的 id
// 3. 符合 isMultipleTextGeometry 的元素，key 是元素 id + text.id （通常不是 id 而是文本位置的常量）
// 4. arrow-line 和 vector-line 文本不依赖于 text.generator，基于 text 可以直接找到 TextManage
export const KEY_TO_TEXT_MANAGE: WeakMap<PlaitBoard, { [key: string]: TextManage }> = new WeakMap();

export const setTextManage = (board: PlaitBoard, element: PlaitElement, text: DrawTextInfo, textManage: TextManage) => {
    const textManages = KEY_TO_TEXT_MANAGE.get(board)!;
    return KEY_TO_TEXT_MANAGE.set(board, { ...textManages, [getTextKey(element, text)]: textManage });
};

export const getTextManage = (board: PlaitBoard, element: PlaitElement | undefined, text: Pick<DrawTextInfo, 'id'>): TextManage => {
    const textManages = KEY_TO_TEXT_MANAGE.get(board)!;
    return textManages[getTextKey(element, text)];
};

export const deleteTextManage = (board: PlaitBoard, key: string) => {
    const textManages = KEY_TO_TEXT_MANAGE.get(board)!;
    delete textManages[key];
    KEY_TO_TEXT_MANAGE.set(board, textManages);
};

export class TextGenerator<T extends PlaitElement = PlaitGeometry> {
    protected board: PlaitBoard;

    protected element: T;

    protected texts: DrawTextInfo[];

    protected options: TextGeneratorOptions<T>;

    public textManages!: TextManage[];

    get shape(): DrawShapes {
        return this.element.shape || this.element.type;
    }

    constructor(board: PlaitBoard, element: T, texts: DrawTextInfo[], options: TextGeneratorOptions<T>) {
        this.board = board;
        this.texts = texts;
        this.element = element;
        this.options = options;
    }

    initialize() {
        const textPlugins = ((this.board as PlaitOptionsBoard).getPluginOptions<WithTextPluginOptions>(WithTextPluginKey) || {})
            .textPlugins;
        this.textManages = this.texts.map((text) => {
            const textManage = this.createTextManage(text, textPlugins);
            setTextManage(this.board, this.element, text, textManage);
            return textManage;
        });
        const ref = PlaitElement.getElementRef<PlaitCommonElementRef>(this.element);
        ref.initializeTextManage(this.textManages);
    }

    draw(elementG: SVGElement) {
        const centerPoint = RectangleClient.getCenterPoint(this.board.getRectangle(this.element)!);
        this.texts.forEach((drawShapeText) => {
            const textManage = getTextManage(this.board, this.element, drawShapeText);
            if (drawShapeText.text && textManage) {
                textManage.draw(drawShapeText.text);
                elementG.append(textManage.g);
                (this.element.angle || this.element.angle === 0) && textManage.updateAngle(centerPoint, this.element.angle);
            }
        });
    }

    update(element: T, previousDrawShapeTexts: DrawTextInfo[], currentDrawShapeTexts: DrawTextInfo[], elementG: SVGElement) {
        this.element = element;

        const centerPoint = RectangleClient.getCenterPoint(this.board.getRectangle(this.element)!);
        const textPlugins = ((this.board as PlaitOptionsBoard).getPluginOptions<WithTextPluginOptions>(WithTextPluginKey) || {})
            .textPlugins;
        const removedTexts = previousDrawShapeTexts.filter((value) => {
            return !currentDrawShapeTexts.find((item) => item.id === value.id);
        });
        if (removedTexts.length) {
            removedTexts.forEach((item) => {
                const textManage = getTextManage(this.board, element, item);
                const index = this.textManages.findIndex((value) => value === textManage);
                if (index > -1 && item.text) {
                    this.textManages.splice(index, 1);
                }
                textManage?.destroy();
                deleteTextManage(this.board, item.id);
            });
        }
        currentDrawShapeTexts.forEach((drawShapeText) => {
            if (drawShapeText.text) {
                let textManage = getTextManage(this.board, this.element, drawShapeText);
                if (!textManage) {
                    textManage = this.createTextManage(drawShapeText, textPlugins);
                    setTextManage(this.board, element, drawShapeText, textManage);
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

    private createTextManage(text: DrawTextInfo, textPlugins?: TextPlugin[]) {
        const textManage = new TextManage(this.board, {
            getRectangle: () => {
                return this.getRectangle(text);
            },
            onChange: (data: TextManageChangeData) => {
                return this.options.onChange(this.element, data, text);
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

    getRectangle(text: DrawTextInfo) {
        const getRectangle = getEngine<T>(this.shape).getTextRectangle;
        if (getRectangle) {
            return getRectangle(this.board, this.element, text);
        }
        return getTextRectangle(this.board, this.element);
    }

    getMaxWidth(text: DrawTextInfo) {
        return this.options.getMaxWidth ? this.options.getMaxWidth() : this.getRectangle(text).width;
    }

    destroy() {
        const ref = PlaitElement.getElementRef<PlaitCommonElementRef>(this.element);
        ref.destroyTextManage();
        this.textManages = [];
        this.texts.forEach((item) => {
            deleteTextManage(this.board, item.id);
        });
    }
}
