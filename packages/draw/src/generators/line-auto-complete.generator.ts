import { PlaitBoard, RgbaToHEX, createG, drawCircle, getSelectedElements, isSelectionMoving } from '@plait/core';
import { PlaitGeometry, PlaitShapeElement } from '../interfaces';
import { ActiveGeneratorExtraData, Generator, PRIMARY_COLOR } from '@plait/common';
import { getAutoCompletePoints } from '../utils';
import { LINE_AUTO_COMPLETE_DIAMETER, LINE_AUTO_COMPLETE_OPACITY } from '../constants/line';

export class LineAutoCompleteGenerator<T extends PlaitShapeElement = PlaitGeometry> extends Generator<T, ActiveGeneratorExtraData> {
    static key = 'line-auto-complete-generator';

    autoCompleteG!: SVGGElement;
    hoverElement: SVGGElement | null = null;

    constructor(public board: PlaitBoard) {
        super(board);
    }

    canDraw(element: PlaitShapeElement, data: ActiveGeneratorExtraData): boolean {
        const selectedElements = getSelectedElements(this.board);
        if (data.selected && selectedElements.length === 1 && !isSelectionMoving(this.board)) {
            return true;
        } else {
            return false;
        }
    }

    draw(element: T, data: ActiveGeneratorExtraData): SVGGElement {
        this.autoCompleteG = createG();
        const middlePoints = getAutoCompletePoints(element);
        middlePoints.forEach((point, index) => {
            const circle = drawCircle(PlaitBoard.getRoughSVG(this.board), point, LINE_AUTO_COMPLETE_DIAMETER, {
                stroke: 'none',
                fill: RgbaToHEX(PRIMARY_COLOR, LINE_AUTO_COMPLETE_OPACITY),
                fillStyle: 'solid'
            });
            circle.classList.add(`line-auto-complete-${index}`);
            this.autoCompleteG.appendChild(circle);
        });
        return this.autoCompleteG;
    }

    removeAutoCompleteG(index: number) {
        this.hoverElement = this.autoCompleteG.querySelector(`.line-auto-complete-${index}`);
        this.hoverElement!.style.visibility = 'hidden';
    }

    recoverAutoCompleteG() {
        if (this.hoverElement) {
            this.hoverElement.style.visibility = 'visible';
            this.hoverElement = null;
        }
    }
}
