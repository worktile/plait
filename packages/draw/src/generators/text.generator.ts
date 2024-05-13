import { WithTextOptions, WithTextPluginKey } from '@plait/common';
import { createG, PlaitBoard, PlaitElement, PlaitOptionsBoard, RectangleClient } from '@plait/core';
import { TextPlugin, TextManageRef, TextManage } from '@plait/text';
import { getEngine } from '../engines';
import { DrawShapes, PlaitDrawShapeText, PlaitGeometry } from '../interfaces';
import { getTextRectangle } from '../utils';
import { ViewContainerRef } from '@angular/core';

export class TextGenerator<T extends PlaitElement = PlaitGeometry> {
    protected board: PlaitBoard;

    protected element: T;

    protected texts: PlaitDrawShapeText[];

    protected viewContainerRef: ViewContainerRef;

    protected shape: DrawShapes;

    protected elementG!: SVGElement;

    protected textPlugins: TextPlugin[] | undefined;

    public textManages!: TextManage[];

    constructor(
        board: PlaitBoard,
        element: T,
        texts: PlaitDrawShapeText[],
        shape: DrawShapes,
        elementG: SVGElement,
        viewContainerRef: ViewContainerRef
    ) {
        this.board = board;
        this.texts = texts;
        this.element = element;
        this.shape = shape;
        this.elementG = elementG;
        this.viewContainerRef = viewContainerRef;
    }

    initialize() {
        this.textPlugins = ((this.board as PlaitOptionsBoard).getPluginOptions<WithTextOptions>(WithTextPluginKey) || {}).textPlugins;
        this.textManages = this.texts.map(text => {
            return this.createTextManage(text);
        });
    }

    draw(textManages: TextManage[]) {
        const g = createG();
        const centerPoint = RectangleClient.getCenterPoint(this.board.getRectangle(this.element)!);
        this.texts.forEach((drawShapeText, index) => {
            const textManage = textManages[index];
            if (drawShapeText.text) {
                textManage.draw(drawShapeText.text);
                g.append(textManage.g);
                this.element.angle ?? textManage.updateAngle(centerPoint, this.element.angle);
            }
        });
        ((this.elementG as unknown) as HTMLElement).append(g);
    }

    update(
        element: T,
        previousDrawShapeTexts: PlaitDrawShapeText[],
        currentDrawShapeTexts: PlaitDrawShapeText[],
        textManages: TextManage[]
    ) {
        this.element = element;
        this.texts = currentDrawShapeTexts;
        previousDrawShapeTexts.forEach((drawShapeText, index) => {
            if (!currentDrawShapeTexts.some(item => item.key === drawShapeText.key)) {
                const textManage = textManages[index];
                this.destroy(textManage);
            }
        });
        const centerPoint = RectangleClient.getCenterPoint(this.board.getRectangle(this.element)!);
        currentDrawShapeTexts.forEach((drawShapeText, index) => {
            if (!previousDrawShapeTexts.some(item => item.key === drawShapeText.key)) {
                const textManage = this.createTextManage(drawShapeText);
                textManages.push(textManage);
                ((this.elementG as unknown) as HTMLElement).append(textManage.g);
            }
            const textManage = textManages[index];
            if (drawShapeText.text) {
                textManage.updateText(drawShapeText.text);
                textManage.updateRectangle();
                this.element.angle ?? textManage.updateAngle(centerPoint, this.element.angle);
            }
        });
    }

    private createTextManage(text: PlaitDrawShapeText) {
        const textManage = new TextManage(this.board, this.viewContainerRef, {
            getRectangle: () => {
                return this.getRectangle(this.element, text);
            },
            onValueChangeHandle: (textManageRef: TextManageRef) => {
                return this.onValueChangeHandle(textManageRef, this.element, text);
            },
            getMaxWidth: () => {
                return this.getMaxWidth(this.element, text);
            },
            textPlugins: this.textPlugins
        });
        return textManage;
    }

    getRectangle(element: T, text: PlaitDrawShapeText) {
        const getRectangle = getEngine<T>(this.shape).getTextRectangle;
        if (getRectangle) {
            return getRectangle(element, text);
        }
        return getTextRectangle(element);
    }
    onValueChangeHandle(textManageRef: TextManageRef, element: T, text: PlaitDrawShapeText) {}
    getMaxWidth(element: T, text: PlaitDrawShapeText) {
        return 0;
    }

    destroy(textManage: TextManage) {
        textManage.destroy();
    }
}
